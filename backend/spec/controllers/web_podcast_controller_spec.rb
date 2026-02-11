require "rails_helper"

RSpec.describe PodcastController, type: :controller do
  render_views

  describe "WebPodcastController GET #index" do
    it "Podcast の Inertia ページを返す" do
      allow(PodcastsIndexUsecase).to receive(:call).and_return(
        {
          podcasts: [
            {
              id: "001",
              title: "テスト回",
              publishedDate: "2026/02/10",
              audioUrl: "https://example.com/001.mp3"
            }
          ]
        }
      )

      get :index

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;Podcast&quot;")
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
      allow(PodcastsShowUsecase).to receive(:call).with(episode_id: "001").and_return(episode)

      get :show, params: { episode_id: "001" }

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;PodcastDetail&quot;")
      expect(response.body).to include("テスト回")
    end

    it "存在しない回なら 404 を返す" do
      allow(PodcastsShowUsecase).to receive(:call).with(episode_id: "999").and_return(nil)

      get :show, params: { episode_id: "999" }

      expect(response).to have_http_status(:not_found)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;PodcastDetail&quot;")
    end
  end
end
