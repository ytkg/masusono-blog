require "rails_helper"

RSpec.describe "WebHome", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /" do
    it "Inertiaページを返す" do
      get "/", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("home")
      expect(inertia.props).to include("app", "flash")
    end
  end

  describe "GET /about" do
    it "Inertiaページを返す" do
      get "/about", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("about")
    end
  end

  describe "GET /settings" do
    it "Inertiaページを返す" do
      get "/settings", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("settings")
    end
  end

  describe "GET /zukan" do
    it "Inertiaページを返す" do
      get "/zukan", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("zukan")
    end
  end
end
