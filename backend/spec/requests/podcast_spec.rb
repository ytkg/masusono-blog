require "rails_helper"

RSpec.describe "WebPodcast", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /podcast" do
    it "Inertiaページを返す" do
      get "/podcast", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component(:podcast)
      expect(inertia.props["episodes"]).to be_nil
    end
  end

  describe "GET /podcast/:episode_id" do
    it "詳細Inertiaページを返す" do
      get "/podcast/001", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component(:podcast_detail)
      expect(inertia.props["episode"]).to be_nil
    end
  end
end
