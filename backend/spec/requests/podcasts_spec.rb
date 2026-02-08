require "rails_helper"

RSpec.describe "Podcasts", type: :request do
  describe "GET /podcasts" do
    let(:podcasts) do
      [
        {
          id: "001",
          title: "テスト回",
          publishedDate: "2026/02/07",
          audioUrl: "https://example.com/podcast/001.mp3"
        }
      ]
    end

    before do
      allow(PodcastsIndexUsecase).to receive(:call).and_return(PodcastsIndexUsecase::Result.new(podcasts: podcasts))
    end

    it do
      get "/podcasts"

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(podcasts.as_json)
    end
  end
end
