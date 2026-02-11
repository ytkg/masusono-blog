require "rails_helper"

RSpec.describe "Cacheable JSON endpoints", type: :request do
  def expect_cache_control(value, max_age:)
    directives = value.to_s.split(",").map(&:strip)
    expect(directives).to include("public", "must-revalidate", "max-age=#{max_age}")
  end

  def expect_cacheable_json(path, max_age:)
    get path

    expect(response).to have_http_status(:ok)
    expect_cache_control(response.headers["Cache-Control"], max_age:)

    etag = response.headers["ETag"]
    expect(etag).to be_present

    get path, headers: { "If-None-Match" => etag }

    expect(response).to have_http_status(:not_modified)
    expect(response.body).to eq("")
    expect_cache_control(response.headers["Cache-Control"], max_age:)
  end

  describe "GET /metrics.json" do
    before do
      allow(MetricsIndexUsecase).to receive(:call).and_return(
        {
          metrics: {
            "blocks" => [
              {
                "label" => "ポッドキャスト総本数",
                "value" => "1 本"
              }
            ]
          }
        }
      )
    end

    it do
      expect_cacheable_json("/metrics.json", max_age: 3600)
    end
  end

  describe "GET /masuda_run/rankings.json" do
    before do
      allow(MasudaRun::RankingsIndexUsecase).to receive(:call).and_return(
        [
          {
            userId: "alice",
            score: 1000,
            rankedAt: "2026/02/11",
            rank: 1
          }
        ]
      )
    end

    it do
      expect_cacheable_json("/masuda_run/rankings.json", max_age: 3600)
    end
  end

  describe "GET /sitemap.xml" do
    before do
      allow(SitemapsIndexUsecase).to receive(:call).and_return(
        {
          xml: <<~XML,
            <?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
              <url>
                <loc>https://masusono.com/</loc>
              </url>
            </urlset>
          XML
          content_type: "application/xml; charset=utf-8"
        }
      )
    end

    it do
      expect_cacheable_json("/sitemap.xml", max_age: 3600)
    end
  end

  describe "ETag invalidation" do
    before do
      allow(MetricsIndexUsecase).to receive(:call).and_return(
        {
          metrics: {
            "blocks" => [
              {
                "label" => "ポッドキャスト総本数",
                "value" => "1 本"
              }
            ]
          }
        },
        {
          metrics: {
            "blocks" => [
              {
                "label" => "ポッドキャスト総本数",
                "value" => "2 本"
              }
            ]
          }
        }
      )
    end

    it "レスポンス内容が変わった場合は304ではなく200を返す" do
      get "/metrics.json"
      first_etag = response.headers["ETag"]

      get "/metrics.json", headers: { "If-None-Match" => first_etag }

      expect(response).to have_http_status(:ok)
      expect(response.headers["ETag"]).to be_present
      expect(response.headers["ETag"]).not_to eq(first_etag)
    end
  end
end
