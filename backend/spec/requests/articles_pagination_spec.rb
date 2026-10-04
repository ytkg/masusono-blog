require "rails_helper"

RSpec.describe "Public articles pagination", type: :request do
  let(:endpoint) { Microcms::FetchArticlesService::ENDPOINT }
  let(:articles) { Array.new(10) { |i| { id: "article-#{i}", title: "記事#{i}", content: "<p>本文</p>" } } }

  before do
    stub_microcms_get(endpoint:, query: { limit: "10", offset: "0", orders: "-publishedAt" },
                      contents: articles, total_count: 128, limit: 10)
  end

  it "トップページでは最初の10記事だけを取得し、次の位置を返す" do
    get "/", headers: { "ACCEPT" => "text/html" }

    expect(response).to have_http_status(:ok)
    expect(inertia.props["articles"].size).to eq(10)
    expect(inertia.props["pagination"]).to eq("nextOffset" => 10)
    expect(inertia.props.dig("articles", 0, "content")).to eq("<p>本文</p>")
    expect(a_request(:get, endpoint).with(query: hash_including("offset" => "0"))).to have_been_made.once
  end

  it "追加ページを取得し、最後のページで次の位置をnullにする" do
    stub_microcms_get(endpoint:, query: { limit: "10", offset: "10", orders: "-publishedAt" },
                      contents: [ { id: "last", content: "<p>末尾</p>" } ], total_count: 11, limit: 10, offset: 10)

    get "/api/app/articles", params: { offset: 10 }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig("articles", 0, "id")).to eq("last")
    expect(response.parsed_body["pagination"]).to eq("nextOffset" => nil)
    expect(response.headers["Cache-Control"]).to include("no-store")
  end

  it "APIのoffsetを省略すると最初のページを返す" do
    get "/api/app/articles"

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["articles"].size).to eq(10)
    expect(response.parsed_body["pagination"]).to eq("nextOffset" => 10)
  end

  it "空ページで追加読み込みを終了する" do
    stub_microcms_get(endpoint:, query: { limit: "10", offset: "20", orders: "-publishedAt" },
                      contents: [], total_count: 15, limit: 10, offset: 20)
    get "/api/app/articles", params: { offset: 20 }

    expect(response.parsed_body).to eq("articles" => [], "pagination" => { "nextOffset" => nil })
  end

  [ "-1", "1.5", "0x10", "invalid" ].each do |offset|
    it "不正なoffset #{offset} はmicroCMSへ送らず400にする" do
      get "/api/app/articles", params: { offset: }

      expect(response).to have_http_status(:bad_request)
      expect(response.parsed_body.dig("error", "code")).to eq("invalid_request")
      expect(response.headers["Cache-Control"]).to include("no-store")
      expect(a_request(:get, endpoint)).not_to have_been_made
    end
  end

  it "upstream通信失敗を成功・空記事として扱わない" do
    stub_request(:get, endpoint).with(query: { limit: "10", offset: "10", orders: "-publishedAt" }).to_raise(Faraday::TimeoutError)
    get "/api/app/articles", params: { offset: 10 }

    expect(response).to have_http_status(:gateway_timeout)
    expect(response.parsed_body.dig("error", "code")).to eq("upstream_timeout")
    expect(response.parsed_body.dig("error", "request_id")).to be_present
    expect(response.headers["Cache-Control"]).to include("no-store")
  end

  it "検索は引き続き全件取得する" do
    all_articles = articles + [ { id: "beyond-home", content: "<p>11番目</p>" } ]
    stub_microcms_get(endpoint:, query: { limit: "100", offset: "0", orders: "-publishedAt" },
                      contents: all_articles, total_count: 11)
    get "/search", headers: { "ACCEPT" => "text/html" }

    expect(response).to have_http_status(:ok)
    expect(inertia.props["articles"].size).to eq(11)
    expect(a_request(:get, endpoint).with(query: hash_including("limit" => "100"))).to have_been_made.once
  end
end
