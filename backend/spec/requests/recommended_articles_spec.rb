require "rails_helper"

RSpec.describe "Recommended articles", type: :request do
  let(:endpoint) { Microcms::FetchArticlesService::ENDPOINT }
  let(:articles) do
    Array.new(5) do |index|
      { id: "article-#{index}", title: "記事#{index}", publishedAt: "2020-01-01T00:00:00Z", content: "<p>本文</p>" }
    end
  end

  before do
    stub_microcms_get(endpoint:, query: { limit: "100", offset: "0", orders: "-publishedAt" }, contents: articles)
  end

  it "全公開記事から重複なしの3件をフィードと同じ形式で返す" do
    get "/api/app/recommended_articles"

    expect(response).to have_http_status(:ok)
    selected = response.parsed_body.fetch("articles")
    expect(selected.size).to eq(3)
    ids = selected.pluck("id")
    expect(ids.uniq.size).to eq(3)
    expect(ids - articles.pluck(:id)).to be_empty
    expect(selected.first).to include("content" => "<p>本文</p>", "publishedDate" => "2020/01/01",
                                     "characterCount" => 2, "readingTimeMinutes" => 0.5)
    expect(response.headers["Cache-Control"]).to include("no-store")
  end

  context "3件未満の場合" do
    let(:articles) { super().first(2) }

    it "存在する記事だけを返す" do
      get "/api/app/recommended_articles"

      expect(response.parsed_body.fetch("articles").pluck("id")).to match_array(articles.pluck(:id))
    end
  end

  context "記事がない場合" do
    let(:articles) { [] }

    it "空の一覧を返す" do
      get "/api/app/recommended_articles"

      expect(response.parsed_body).to eq("articles" => [])
    end
  end

  context "取得結果に同じ記事IDがある場合" do
    let(:articles) { [ super().first ] * 4 }

    it "同じ記事を複数表示しない" do
      get "/api/app/recommended_articles"

      expect(response.parsed_body.fetch("articles").pluck("id")).to eq([ "article-0" ])
    end
  end

  context "記事が100件を超える場合" do
    let(:articles) { Array.new(100) { |index| { id: "recent-#{index}" } } }

    it "2ページ目も取得して抽選対象に含める" do
      stub_microcms_get(endpoint:, query: { limit: "100", offset: "0", orders: "-publishedAt" },
                        contents: articles, total_count: 101)
      stub_microcms_get(endpoint:, query: { limit: "100", offset: "100", orders: "-publishedAt" },
                        contents: [ { id: "old" } ], total_count: 101, offset: 100)
      get "/api/app/recommended_articles"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.fetch("articles").size).to eq(3)
      assert_requested(:get, endpoint, query: { limit: "100", offset: "100", orders: "-publishedAt" })
    end
  end

  it "upstreamの失敗を共通エラーとして返す" do
    stub_request(:get, endpoint).with(query: { limit: "100", offset: "0", orders: "-publishedAt" }).to_raise(Faraday::TimeoutError)
    get "/api/app/recommended_articles"

    expect(response).to have_http_status(:gateway_timeout)
    expect(response.parsed_body.dig("error", "code")).to eq("upstream_timeout")
    expect(response.parsed_body.dig("error", "request_id")).to be_present
    expect(response.headers["Cache-Control"]).to include("no-store")
  end
end
