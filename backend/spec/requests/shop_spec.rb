require "rails_helper"

RSpec.describe "WebShop", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /shop" do
    let(:shops) do
      [
        {
          name: "テスト居酒屋",
          category: "居酒屋",
          lat: 35.0,
          lng: 139.0,
          url: "https://example.com/shop",
          desc: "説明"
        }
      ]
    end

    before do
      allow(ShopIndexUsecase).to receive(:call).and_return(
        { shops: shops, status: :ok }
      )
    end

    it "Inertiaページを返す" do
      get "/shop", headers: html_headers
      page = inertia_page

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(page["component"]).to eq("shop/index")
      expect(page.dig("props", "shops", 0, "name")).to eq("テスト居酒屋")
    end
  end
end
