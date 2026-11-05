require "rails_helper"

RSpec.describe AuthorPayloadBuilder do
  describe ".call" do
    subject(:result) { described_class.call(author:) }

    let(:author) do
      {
        id: "author-1",
        name: "増田",
        title: "著者肩書き",
        bio: "プロフィール本文",
        imageUrl: "https://images.microcms-assets.io/assets/masuda.webp"
      }
    end

    it do
      expect(result).to eq(
        {
          id: "author-1",
          name: "増田",
          title: "著者肩書き",
          bio: "プロフィール本文",
          imageUrl: "https://images.microcms-assets.io/assets/masuda.webp?fit=crop&w=192&h=192"
        }
      )
    end

    context "idまたは名前が空の場合" do
      let(:author) { { id: "", name: "増田" } }

      it do
        expect(result).to be_nil
      end
    end
    [ nil, "" ].each do |name|
      context "名前が#{name.inspect}の場合" do
        let(:author) { { id: "author-1", name: name } }

        it { expect(result).to be_nil }
      end
    end

    [ :icon, :image, :imageUrl, :profileImage ].each do |key|
      [ "https://example.test/author.png", { url: "https://example.test/author.png" } ].each do |image|
        context "#{key}が#{image.class}の場合" do
          let(:author) { { id: "author-1", name: "増田", key => image } }

          it { expect(result[:imageUrl]).to eq("https://example.test/author.png") }
        end
      end
    end

    context "画像が複数ある場合" do
      let(:author) { { id: "author-1", name: "増田", icon: "https://example.test/icon.png", image: "https://example.test/image.png" } }

      it { expect(result[:imageUrl]).to eq("https://example.test/icon.png") }
    end

    [ nil, false, 123, [], {} ].each do |image|
      context "画像が#{image.inspect}の場合" do
        let(:author) { { id: "author-1", name: "増田", icon: image } }

        it { expect(result[:imageUrl]).to be_nil }
      end
    end
  end
end
