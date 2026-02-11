require "rails_helper"

RSpec.describe PodcastController, type: :controller do
  render_views

  describe "WebPodcastController GET #index" do
    it "Podcast の Inertia ページを返す" do
      allow(PodcastIndexUsecase).to receive(:call).and_return(
        {
          episodes: [
            {
              id: "001",
              title: "テスト回",
              publishedDate: "2026/02/10",
              audioUrl: "https://example.com/001.mp3"
            }
          ],
          status: :ok
        }
      )

      get :index

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;podcast/index&quot;")
      expect(response.body).to include("テスト回")
    end
  end

  describe "WebPodcastController GET #show" do
    let(:episode) do
      {
        id: "001",
        title: "テスト回",
        publishedDate: "2026/02/10",
        audioUrl: "https://example.com/001.mp3"
      }
    end

    it "存在する回なら PodcastDetail を返す" do
      allow(PodcastShowUsecase).to receive(:call).with(episode_id: "001").and_return(
        { episode: episode, status: :ok }
      )

      get :show, params: { episode_id: "001" }

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;podcast/show&quot;")
      expect(response.body).to include("テスト回")
    end

    it "存在しない回なら 404 を返す" do
      allow(PodcastShowUsecase).to receive(:call).with(episode_id: "999").and_return(
        { episode: nil, status: :not_found }
      )

      get :show, params: { episode_id: "999" }

      expect(response).to have_http_status(:not_found)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;podcast/show&quot;")
    end
  end
end
