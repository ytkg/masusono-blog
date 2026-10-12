require "rails_helper"

RSpec.describe ArticleImagesShowUsecase do
  subject(:result) { described_class.call(article_id: "article-1", version:) }

  let(:article) { { id: "article-1", title: "公開記事" } }
  let(:version) { ArticleOgpImage.version(article:) }

  before do
    allow(Article).to receive(:find).with("article-1").and_return(article)
    allow(ArticleOgpImage).to receive(:call).and_return("PNG bytes")
  end

  it "公開記事の現在の画像を返す" do
    expect(result).to eq(found: true, image: "PNG bytes")
  end

  context "記事が非公開になった場合" do
    before do
      allow(Article).to receive(:find).and_return(nil)
    end

    it "画像キャッシュへアクセスしない" do
      expect(result).to eq(found: false)
      expect(ArticleOgpImage).not_to have_received(:call)
    end
  end

  context "古い版のURLの場合" do
    let(:version) { "old" }

    it "画像を生成せず現在のURLを返す" do
      expect(result).to eq(found: true, redirect_path: ArticleOgpImage.path(article:))
      expect(ArticleOgpImage).not_to have_received(:call)
    end
  end
end
