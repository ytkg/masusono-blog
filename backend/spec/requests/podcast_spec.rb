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
        { episodes: episodes, status: :ok }
      )
    end

    it "Inertiaページを返す" do
      get "/podcast", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("podcast/index")
      expect(inertia.props.dig("episodes", 0, "title")).to eq("テスト回")
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
        { episode: episode, status: :ok }
      )

      get "/podcast/001", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("podcast/show")
      expect(inertia.props.dig("episode", "title")).to eq("テスト回")
    end

    it "存在しない場合は404のInertiaページを返す" do
      allow(PodcastShowUsecase).to receive(:call).with(episode_id: "999").and_return(
        { episode: nil, status: :not_found }
      )

      get "/podcast/999", headers: html_headers

      expect(response).to have_http_status(:not_found)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("podcast/show")
      expect(inertia.props.dig("episode")).to be_nil
    end
  end
end
