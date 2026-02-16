require "rails_helper"

RSpec.describe "WebShop", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /shop" do
    before do
      allow(ShopIndexUsecase).to receive(:call).and_return(
        {
          shops: [
            {
              name: "テスト居酒屋",
              category: "居酒屋",
              lat: 35.0,
              lng: 139.0,
              url: "https://example.com/shop",
              desc: "テスト説明"
            }
          ]
        }
      )
    end

    it "Inertiaページを返す" do
      get "/shop", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("shop/index")
      expect(inertia.props.dig("shops", 0, "name")).to eq("テスト居酒屋")
    end
  end
end
