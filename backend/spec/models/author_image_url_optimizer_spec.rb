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

RSpec.describe AuthorImageUrlOptimizer do
  [ nil, "", "https://[invalid", "http://images.microcms-assets.io/a.jpg", "//images.microcms-assets.io/a.jpg" ].each do |url|
    it "preserves unsupported or invalid URL #{url.inspect}" do
      expect(described_class.call(url)).to eq(url)
    end
  end

  it "replaces all avatar-size parameters while preserving unrelated repeated parameters" do
    url = "https://images.microcms-assets.io/a.jpg?tag=a&tag=b&w=1&w=2&h=3&fit=max".freeze
    result = described_class.call(url)
    expect(result).to eq("https://images.microcms-assets.io/a.jpg?tag=a&tag=b&fit=crop&w=192&h=192")
    expect(url).to end_with("w=1&w=2&h=3&fit=max")
  end
end
