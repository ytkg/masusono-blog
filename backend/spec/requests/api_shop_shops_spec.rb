require "rails_helper"

RSpec.describe "Api::Shop::Shops", type: :request do
  describe "GET /api/shop/shops.json" do
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
              desc: "説明"
            }
          ]
        }
      )
    end

    it "JSONを返す" do
      get "/api/shop/shops.json"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      payload = JSON.parse(response.body)
      expect(payload["shops"]).to be_an(Array)
      expect(payload.dig("shops", 0, "name")).to eq("テスト居酒屋")
    end
  end
end
