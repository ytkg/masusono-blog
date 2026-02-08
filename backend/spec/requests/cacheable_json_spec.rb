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

  describe "GET /articles.json" do
    before do
      allow(ArticlesIndexUsecase).to receive(:call).and_return(
        ArticlesIndexUsecase::Result.new(
          articles: [
            {
              id: "first",
              publishedDate: "2025/10/05",
              title: "first title",
              content: "<p>first body</p>",
              author: "増田太郎"
            }
          ]
        )
      )
    end

    it do
      expect_cacheable_json("/articles.json", max_age: 3600)
    end
  end

  describe "GET /podcasts.json" do
    before do
      allow(PodcastsIndexUsecase).to receive(:call).and_return(
        PodcastsIndexUsecase::Result.new(
          podcasts: [
            {
              "id" => "001",
              "title" => "テスト回",
              "publishedDate" => "2026/02/07",
              "audioUrl" => "https://example.com/podcast/001.mp3"
            }
          ]
        )
      )
    end

    it do
      expect_cacheable_json("/podcasts.json", max_age: 3600)
    end
  end

  describe "GET /metrics.json" do
    before do
      allow(MetricsIndexUsecase).to receive(:call).and_return(
        MetricsIndexUsecase::Result.new(
          metrics: {
            "blocks" => [
              {
                "kind" => "single",
                "metric" => {
                  "label" => "ポッドキャスト総本数",
                  "value" => "1 本"
                }
              }
            ]
          }
        )
      )
    end

    it do
      expect_cacheable_json("/metrics.json", max_age: 3600)
    end
  end

  describe "GET /shops.json" do
    before do
      allow(ShopsIndexUsecase).to receive(:call).and_return(
        ShopsIndexUsecase::Result.new(
          shops: [
            {
              name: "テスト居酒屋",
              lat: 35.0,
              lng: 139.0,
              category: "居酒屋",
              url: "https://example.com/shop",
              desc: "テスト説明"
            }
          ]
        )
      )
    end

    it do
      expect_cacheable_json("/shops.json", max_age: 3600)
    end
  end

  describe "ETag invalidation" do
    before do
      allow(ArticlesIndexUsecase).to receive(:call).and_return(
        ArticlesIndexUsecase::Result.new(articles: [ { id: "first", title: "first title" } ]),
        ArticlesIndexUsecase::Result.new(articles: [ { id: "first", title: "updated title" } ])
      )
    end

    it "レスポンス内容が変わった場合は304ではなく200を返す" do
      get "/articles.json"
      first_etag = response.headers["ETag"]

      get "/articles.json", headers: { "If-None-Match" => first_etag }

      expect(response).to have_http_status(:ok)
      expect(response.headers["ETag"]).to be_present
      expect(response.headers["ETag"]).not_to eq(first_etag)
    end
  end
end
