require "rails_helper"

RSpec.describe "WebPodcast", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /podcast" do
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

    it "Inertiaページを返す" do
      get "/podcast", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("podcast/index")
      expect(inertia.props.dig("episodes", 0, "id")).to eq("001")
    end
  end

  describe "GET /podcast/:episode_id" do
    context "エピソードが存在する場合" do
      before do
        allow(PodcastShowUsecase).to receive(:call).with(episode_id: "001").and_return(
          {
            episode: {
              id: "001",
              title: "テスト回",
              publishedDate: "2026/02/10",
              audioUrl: "https://example.com/001.mp3"
            }
          }
        )
      end

      it "詳細Inertiaページを返す" do
        get "/podcast/001", headers: html_headers

        expect(response).to have_http_status(:ok)
        expect(inertia).to be_inertia_response
        expect(inertia).to render_component("podcast/show")
        expect(inertia.props.dig("episode", "id")).to eq("001")
      end
    end

    context "エピソードが存在しない場合" do
      before do
        allow(PodcastShowUsecase).to receive(:call).with(episode_id: "missing").and_return(
          {
            episode: nil
          }
        )
      end

      it "Inertiaの404ページを返す" do
        get "/podcast/missing", headers: html_headers

        expect(response).to have_http_status(:not_found)
        expect(inertia).to be_inertia_response
        expect(inertia).to render_component("errors/not_found")
      end
    end
  end
end
