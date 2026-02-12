require "rails_helper"

RSpec.describe "WebShop", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /shop" do
    it "Inertiaページを返す" do
      get "/shop", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component(:shop)
      expect(inertia.props["shops"]).to be_nil
    end
  end
end
