require "rails_helper"

RSpec.describe AuthorImageUrlOptimizer do
  describe ".call" do
    it "microCMSの著者画像をアバター表示用のサイズにする" do
      result = described_class.call("https://images.microcms-assets.io/assets/author.webp?foo=bar&w=1024")

      expect(result).to eq("https://images.microcms-assets.io/assets/author.webp?foo=bar&fit=crop&w=192&h=192")
    end

    it "microCMS以外の画像URLは変更しない" do
      url = "https://example.com/assets/author.webp"

      expect(described_class.call(url)).to eq(url)
    end
  end
end
