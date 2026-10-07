require "rails_helper"

RSpec.describe WebPush::ArticleNotificationPayload do
  subject(:result) { described_class.call(article:) }

  let(:article) { { id: "a", title: "記事", author: { name: "その他1" } } }

  it "記事の投稿者名、本文、遷移先を組み立てる" do
    expect(result).to eq(title: "その他1が新しい記事を書いたよ", body: "記事", url: "/articles/a")
  end

  context "投稿者名が空白の場合" do
    let(:article) { { id: "a", title: "記事", author: { name: "  " } } }

    it "汎用のタイトルを返す" do
      expect(result[:title]).to eq("新しい記事が公開されたよ")
    end
  end

  context "記事IDがない場合" do
    let(:article) { { title: "記事" } }

    it "不完全な通知を作らず、欠落を呼び出し側へ伝える" do
      expect { result }.to raise_error(KeyError)
    end
  end
end
