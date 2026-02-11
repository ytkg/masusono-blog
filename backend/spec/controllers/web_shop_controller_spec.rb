require "rails_helper"

RSpec.describe ShopController, type: :controller do
  render_views

  describe "WebShopController GET #index" do
    it "Shop の Inertia ページを返す" do
      allow(ShopsIndexUsecase).to receive(:call).and_return(
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

      get :index

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;Shops&quot;")
      expect(response.body).to include("テスト居酒屋")
    end
  end
end
