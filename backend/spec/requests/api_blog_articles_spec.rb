require "rails_helper"

RSpec.describe "Api::Blog::Articles", type: :request do
  describe "GET /api/blog/articles.json" do
    before do
      allow(Api::Blog::ArticlesIndexUsecase).to receive(:call).and_return(
        {
          articles: [
            {
              id: "article-1",
              title: "記事1",
              publishedDate: "2026/02/10",
              content: "<p>本文1</p>",
              author: "著者1"
            }
          ]
        }
      )
    end

    it "JSONを返す" do
      get "/api/blog/articles.json"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      payload = JSON.parse(response.body)
      expect(payload["articles"]).to be_an(Array)
      expect(payload.dig("articles", 0, "title")).to eq("記事1")
    end
  end
end
