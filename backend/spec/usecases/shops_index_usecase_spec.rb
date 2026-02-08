require "rails_helper"

RSpec.describe ShopsIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:shops) do
      [
        {
          name: "テスト居酒屋",
          lat: 35.0,
          lng: 139.0,
          category: "居酒屋",
          url: "https://example.com/shop",
          desc: "テスト説明"
        }
      ]
    end

    before do
      allow(Shop).to receive(:all).and_return(shops)
    end

    it do
      expect(result.shops).to eq(
        [
          {
            name: "テスト居酒屋",
            category: "居酒屋",
            lat: 35.0,
            lng: 139.0,
            url: "https://example.com/shop",
            desc: "テスト説明"
          }
        ]
      )
    end

    it "キー順は name, category, lat, lng, url, desc" do
      expect(result.shops.map(&:keys)).to all(eq(%i[name category lat lng url desc]))
    end
  end
end
