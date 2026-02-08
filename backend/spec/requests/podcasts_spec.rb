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
      allow(PodcastsIndexUsecase).to receive(:call).and_return({ podcasts: podcasts })
    end

    it_behaves_like "array json contract",
                    path: "/podcasts",
                    expected_keys: %w[id title publishedDate audioUrl]

    it do
      get "/podcasts"

      payload = JSON.parse(response.body)
      expect(payload.size).to eq(1)
      expect(payload.first).to eq(
        {
          "id" => "001",
          "title" => "テスト回",
          "publishedDate" => "2026/02/07",
          "audioUrl" => "https://example.com/podcast/001.mp3"
        }
      )
    end
  end
end
