require "rails_helper"

RSpec.describe "Api::Podcast::Episodes", type: :request do
  describe "GET /api/podcast/episodes.json" do
    before do
      allow(PodcastIndexUsecase).to receive(:call).and_return(
        {
          episodes: [
            {
              id: "001",
              title: "テスト回",
              publishedDate: "2026/02/10",
              audioUrl: "https://example.com/001.mp3"
            }
          ]
        }
      )
    end

    it "JSONを返す" do
      get "/api/podcast/episodes.json"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      payload = JSON.parse(response.body)
      expect(payload["episodes"]).to be_an(Array)
      expect(payload.dig("episodes", 0, "title")).to eq("テスト回")
    end
  end
end
