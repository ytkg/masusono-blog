require "rails_helper"

RSpec.describe "Calendar articles", type: :request do
  let(:endpoint) { Microcms::FetchArticlesService::ENDPOINT }
  let(:articles) do
    [
      { id: "december", publishedAt: "2026-12-31T00:00:00Z", content: "<p>年末</p>" },
      { id: "new", publishedAt: "2026-01-01T00:00:00Z", content: "<p>新年</p>" },
      { id: "old", publishedAt: "2024-12-31T16:00:00Z", content: "<p>前年</p>" },
      { id: "leap", publishedAt: "2024-02-29T00:00:00Z", content: "<p>閏日</p>" }
    ]
  end

  before do
    stub_microcms_get(endpoint:, query: { limit: "100", offset: "0", orders: "-publishedAt" }, contents: articles)
  end

  it "全期間の記事を日本時間の月日順にまとめ、同日の公開日時降順を維持する" do
    get "/api/app/calendar_articles"

    expect(response).to have_http_status(:ok)
    groups = response.parsed_body.fetch("groups")
    expect(groups.pluck("monthDay")).to eq([ "01/01", "02/29", "12/31" ])
    expect(groups.first.fetch("articles").pluck("id")).to eq([ "new", "old" ])
    expect(groups.first.fetch("articles").pluck("publishedDate")).to eq([ "2026/01/01", "2025/01/01" ])
    expect(groups.first.fetch("articles").first.fetch("content")).to eq("<p>新年</p>")
    expect(response.headers["Cache-Control"]).to include("no-store")
  end

  context "記事がない場合" do
    let(:articles) { [] }

    it "空のグループを返す" do
      get "/api/app/calendar_articles"

      expect(response.parsed_body).to eq("groups" => [])
    end
  end

  it "upstreamの失敗を共通エラーとして返す" do
    stub_request(:get, endpoint).with(query: { limit: "100", offset: "0", orders: "-publishedAt" }).to_raise(Faraday::TimeoutError)
    get "/api/app/calendar_articles"

    expect(response).to have_http_status(:gateway_timeout)
    expect(response.parsed_body.dig("error", "code")).to eq("upstream_timeout")
    expect(response.parsed_body.dig("error", "request_id")).to be_present
    expect(response.headers["Cache-Control"]).to include("no-store")
  end
end
