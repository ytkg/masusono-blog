require "rails_helper"

RSpec.describe "Podcasts", type: :request do
  describe "GET /podcasts" do
    let(:podcasts) do
      [
        {
          "id" => "001",
          "title" => "テスト回",
          "publishedAt" => "2026/02/07",
          "audioUrl" => "https://example.com/podcast/001.mp3"
        }
      ]
    end

    before do
      allow(Podcast).to receive(:all).and_return(podcasts)
    end

    it do
      get "/podcasts"

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(podcasts)
    end
  end
end
