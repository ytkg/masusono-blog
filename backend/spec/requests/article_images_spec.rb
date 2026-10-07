require "rails_helper"

RSpec.describe "Article images", type: :request do
  let(:article) { { id: "article-1", title: "公開記事" } }
  let(:path) { ArticleOgpImage.path(article:) }

  before do
    allow(Article).to receive(:find).with("article-1").and_return(article)
  end

  it "認証なしでPNGを返しブラウザ・共有キャッシュへの保存を禁止する" do
    get path
    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("image/png")
    expect(response.body.byteslice(16, 8).unpack("NN")).to eq([ 1200, 630 ])
    expect(response.headers["Cache-Control"]).to include("no-store")
  end

  it "生成失敗時も公開記事には共通PNGを200で返す" do
    renderer = instance_double(ArticleOgpImage)
    allow(ArticleOgpImage).to receive(:new).and_return(renderer)
    allow(renderer).to receive(:render).and_raise(ArticleOgpImage::GenerationError)
    get path
    expect(response).to have_http_status(:ok)
    expect(response.media_type).to eq("image/png")
    expect(response.body).to eq(File.binread(Rails.root.join("public/ogp-fallback.png")))
  end

  it "タイトル変更後の旧URLは新しい版へリダイレクトする" do
    original_path = path
    updated = article.merge(title: "変更済み")
    allow(Article).to receive(:find).and_return(updated)
    get original_path
    expect(response).to have_http_status(:temporary_redirect)
    expect(response).to redirect_to(ArticleOgpImage.path(article: updated))
  end

  it "存在しない記事や非公開化した記事は旧URLでも404にする" do
    original_path = path
    allow(Article).to receive(:find).and_return(nil)
    get original_path
    expect(response).to have_http_status(:not_found)
    expect(response.body).to be_empty
  end

  it "CMS障害時はキャッシュ済み画像を公開せず503にする" do
    allow(Article).to receive(:find).and_raise(Faraday::TimeoutError)
    get path
    expect(response).to have_http_status(:service_unavailable)
  end
end
