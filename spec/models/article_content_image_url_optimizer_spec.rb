require "rails_helper"

RSpec.describe ArticleContentImageUrlOptimizer do
  describe ".call" do
    subject(:result) { described_class.call(content) }

    context "microCMS画像が含まれる場合" do
      let(:content) do
        <<~HTML
          <p>本文</p><img src="https://images.microcms-assets.io/assets/photo.jpg?fm=webp&w=1200&h=900" alt="写真">
        HTML
      end

      it do
        image = Nokogiri::HTML5.fragment(result).at_css("img")

        expect(image["src"]).to eq("https://images.microcms-assets.io/assets/photo.jpg?fm=webp&fit=max&w=800&h=800")
        expect(image["srcset"]).to eq(
          "https://images.microcms-assets.io/assets/photo.jpg?fm=webp&fit=max&w=400&h=400 400w, " \
          "https://images.microcms-assets.io/assets/photo.jpg?fm=webp&fit=max&w=800&h=800 800w"
        )
        expect(image["sizes"]).to eq("(max-width: 800px) 100vw, 800px")
        expect(image["decoding"]).to eq("async")
      end
    end

    context "microCMS以外の画像の場合" do
      let(:content) { '<img src="https://example.com/photo.jpg" alt="写真">' }

      it do
        expect(result).to eq(content)
      end
    end

    it "対象外の画像属性を保ち、他の画像だけを変換する" do
      content = '<img src="http://images.microcms-assets.io/photo.jpg" srcset="original 2x" sizes="50vw">' \
                '<img src="/local.jpg"><img src="https://invalid url">' \
                '<img src="https://images.microcms-assets.io/photo.jpg?fit=crop&amp;w=20&amp;w=40#photo">'
      images = Nokogiri::HTML5.fragment(described_class.call(content)).css("img")

      expect(images[0]["srcset"]).to eq("original 2x")
      expect(images[0]["sizes"]).to eq("50vw")
      expect(images[1]["src"]).to eq("/local.jpg")
      expect(images[2]["src"]).to eq("https://invalid url")
      expect(images[3]["src"]).to eq("https://images.microcms-assets.io/photo.jpg?fit=max&w=800&h=800#photo")
    end

    context "HTML文字列ではない場合" do
      let(:content) { { html: "本文" } }

      it do
        expect(result).to equal(content)
      end
    end
  end
end
