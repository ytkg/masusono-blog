require "rails_helper"

RSpec.describe MicrocmsImageUrl do
  describe ".parse" do
    [ nil, {}, "", "/photo.jpg", "https://example.com/photo.jpg",
      "http://images.microcms-assets.io/photo.jpg", "https://images.microcms-assets.io.evil.example/photo.jpg",
      "https://images.microcms-assets.io/photo with space.jpg" ].each do |url|
      it "変換対象外の#{url.inspect}を受け付けない" do
        expect(described_class.parse(url)).to be_nil
      end
    end
  end

  describe "#resize" do
    it "全ての既存サイズ指定を置換し、他のクエリ・フラグメントと元URLを保持する" do
      url = "https://images.microcms-assets.io/photo.jpg?fm=webp&w=100&w=200&h=300&fit=crop&tag=a&tag=b&text=%E5%86%99%E7%9C%9F#detail"
      image = described_class.parse(url)
      original = url.dup

      expect(image.resize(fit: "max", size: 800)).to eq(
        "https://images.microcms-assets.io/photo.jpg?fm=webp&tag=a&tag=b&text=%E5%86%99%E7%9C%9F&fit=max&w=800&h=800#detail"
      )
      expect(image.resize(fit: "max", size: 400)).to end_with("&fit=max&w=400&h=400#detail")
      expect(image.resize(fit: "crop", size: 192)).to end_with("&fit=crop&w=192&h=192#detail")
      expect(url).to eq(original)
    end
  end
end
