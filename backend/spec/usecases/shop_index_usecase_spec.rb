require "rails_helper"

RSpec.describe ShopIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    before do
      allow(Api::Shop::ShopsIndexUsecase).to receive(:call).and_return(
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

    it do
      expect(result).to eq(
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
  end
end
