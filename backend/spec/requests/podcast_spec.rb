require "rails_helper"

RSpec.describe "WebPodcast", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /podcast" do
    let(:episodes) do
      [
        {
          id: "001",
          title: "テスト回",
          publishedDate: "2026/02/10",
          audioUrl: "https://example.com/001.mp3"
        }
      ]
    end

    before do
      allow(PodcastIndexUsecase).to receive(:call).and_return(
        { props: { episodes: episodes }, status: :ok }
      )
    end

    it "Inertiaページを返す" do
      get "/podcast", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;podcast/index&quot;")
      expect(response.body).to include("テスト回")
    end
  end

  describe "GET /podcast/:episode_id" do
    let(:episode) do
      {
        id: "001",
        title: "テスト回",
        publishedDate: "2026/02/10",
        audioUrl: "https://example.com/001.mp3"
      }
    end

    it "存在する場合は詳細Inertiaページを返す" do
      allow(PodcastShowUsecase).to receive(:call).with(episode_id: "001").and_return(
        { props: { episode: episode }, status: :ok }
      )

      get "/podcast/001", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;podcast/show&quot;")
      expect(response.body).to include("テスト回")
    end

    it "存在しない場合は404のInertiaページを返す" do
      allow(PodcastShowUsecase).to receive(:call).with(episode_id: "999").and_return(
        { props: { episode: nil }, status: :not_found }
      )

      get "/podcast/999", headers: html_headers

      expect(response).to have_http_status(:not_found)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;podcast/show&quot;")
    end
  end
end
