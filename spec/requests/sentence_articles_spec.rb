require "rails_helper"

RSpec.describe "Sentence articles", type: :request do
  let(:endpoint) { Microcms::FetchArticlesService::ENDPOINT }
  let(:articles) { Array.new(100) { |index| { id: "article-#{index}", content: "<p>本文。</p>", title: "タイトル" } } }

  before do
    stub_microcms_get(endpoint:, query: { limit: "100", offset: "0", orders: "-publishedAt" }, contents: articles, total_count: 101)
    stub_microcms_get(endpoint:, query: { limit: "100", offset: "100", orders: "-publishedAt" }, contents: [ { id: "old", content: "<p>昔の書き出し。</p>" } ], total_count: 101, offset: 100)
  end

  it "全ページの本文とIDを返し、初期候補に古い記事も含める" do
    get "/api/app/sentence_articles"

    expect(response).to have_http_status(:ok)
    result = response.parsed_body.fetch("articles")
    expect(result.size).to eq(101)
    expect(result.last).to eq("id" => "old", "content" => "<p>昔の書き出し。</p>")
    expect(result.first.keys).to contain_exactly("id", "content")
    expect(response.headers["Cache-Control"]).to include("no-store")
  end

  it "記事がないときは空配列を返す" do
    stub_microcms_get(endpoint:, query: { limit: "100", offset: "0", orders: "-publishedAt" }, contents: [])
    get "/api/app/sentence_articles"
    expect(response.parsed_body).to eq("articles" => [])
  end

  it "本文のない記事も文字列として返し、ブラウザで候補から除外できる" do
    stub_microcms_get(endpoint:, query: { limit: "100", offset: "0", orders: "-publishedAt" }, contents: [ { id: "empty", content: nil } ])
    get "/api/app/sentence_articles"
    expect(response.parsed_body).to eq("articles" => [ { "id" => "empty", "content" => "" } ])
  end

  it "後続ページの失敗時も部分的な候補を返さず共通エラーを返す" do
    stub_request(:get, endpoint).with(query: { limit: "100", offset: "100", orders: "-publishedAt" }).to_raise(Faraday::TimeoutError)
    get "/api/app/sentence_articles"

    expect(response).to have_http_status(:gateway_timeout)
    expect(response.parsed_body.dig("error", "code")).to eq("upstream_timeout")
    expect(response.parsed_body.dig("error", "request_id")).to be_present
    expect(response.headers["Cache-Control"]).to include("no-store")
  end
end
