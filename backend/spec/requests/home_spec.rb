require "rails_helper"

RSpec.describe "WebHome", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /" do
    it "Inertiaページを返す" do
      get "/", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("data-page=")
      expect(response.body).to include("&quot;component&quot;:&quot;Home&quot;")
    end
  end

  describe "GET /about" do
    it "Inertiaページを返す" do
      get "/about", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("data-page=")
      expect(response.body).to include("&quot;component&quot;:&quot;About&quot;")
    end
  end
end
