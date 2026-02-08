require "rails_helper"

RSpec.describe "Shops", type: :request do
  describe "GET /shops" do
    let(:shops) do
      [
        {
          name: "テスト居酒屋",
          category: "居酒屋",
          lat: 35.0,
          lng: 139.0,
          url: "https://example.com/shop-1",
          desc: "テスト説明1"
        },
        {
          name: "テストラーメン店",
          category: "ラーメン",
          lat: 35.1,
          lng: 139.1,
          url: nil,
          desc: nil
        }
      ]
    end

    before do
      allow(ShopsIndexUsecase).to receive(:call).and_return({ shops: shops })
    end

    it_behaves_like "array json contract",
                    path: "/shops",
                    expected_keys: %w[name category lat lng url desc]

    it "件数・型・代表値を満たす" do
      get "/shops"

      payload = JSON.parse(response.body)
      expect(payload.size).to eq(2)
      expect(payload.first["name"]).to eq("テスト居酒屋")
      expect(payload.first["category"]).to eq("居酒屋")
      expect(payload.first["lat"]).to be_a(Float)
      expect(payload.first["lng"]).to be_a(Float)
      expect(payload.second["url"]).to be_nil
      expect(payload.second["desc"]).to be_nil
    end
  end
end
