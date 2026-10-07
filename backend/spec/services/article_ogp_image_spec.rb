require "rails_helper"

RSpec.describe ArticleOgpImage do
  let(:article) { { id: "article-1", title: "増田とその他！" } }

  describe ".version" do
    it "タイトルとテンプレート変更で版が変わる" do
      original = described_class.version(article:)
      expect(described_class.version(article: article.dup)).to eq(original)
      expect(described_class.version(article: article.merge(title: "更新"))).not_to eq(original)
      stub_const("ArticleOgpImage::TEMPLATE_VERSION", "next")
      expect(described_class.version(article:)).not_to eq(original)
    end
  end

  describe ".call" do
    subject(:result) { described_class.call(article:) }

    it "日本語タイトル入り1200×630 PNGを生成する" do
      expect(result.byteslice(0, 8)).to eq("\x89PNG\r\n\x1a\n".b)
      expect(result.byteslice(16, 8).unpack("NN")).to eq([ 1200, 630 ])
      expect(result.bytesize).to be < 5.megabytes
      expect(described_class.new.render(title: article[:title])).to eq(result)
      expect(result).not_to eq(File.binread(Rails.root.join("public/ogp-fallback.png")))
    end

    it "同じ版の画像をキャッシュする" do
      allow(Rails).to receive(:cache).and_return(ActiveSupport::Cache::MemoryStore.new)
      renderer = instance_double(described_class, render: "png")
      allow(described_class).to receive(:new).and_return(renderer)
      2.times { expect(described_class.call(article:)).to eq("png") }
      expect(renderer).to have_received(:render).once
    end

    context "生成に失敗する場合" do
      before do
        renderer = instance_double(described_class)
        allow(described_class).to receive(:new).and_return(renderer)
        allow(renderer).to receive(:render).and_raise(described_class::GenerationError)
      end

      it "キャッシュせず背景とロゴの共通PNGを返す" do
        expect(result).to eq(File.binread(Rails.root.join("public/ogp-fallback.png")))
      end
    end
  end

  describe "長文・絵文字の描画" do
    [ "日本語の長いタイトル👨‍👩‍👧‍👦🎉" * 15, "<b>見出し & 引用</b> 🥳✨" ].each do |title|
      it "#{title.first(20)}を描画できる" do
        bytes = described_class.new.render(title:)
        expect(bytes.byteslice(16, 8).unpack("NN")).to eq([ 1200, 630 ])
      end
    end
  end
end
