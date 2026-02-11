require "rails_helper"

RSpec.describe "WebHome", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /" do
    it "Inertiaページを返す" do
      get "/", headers: html_headers
      page = inertia_page

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(page["component"]).to eq("home/show")
      expect(page["props"]).to include("app", "flash")
    end
  end

  describe "GET /about" do
    it "Inertiaページを返す" do
      get "/about", headers: html_headers
      page = inertia_page

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(page["component"]).to eq("about/show")
    end
  end
end
