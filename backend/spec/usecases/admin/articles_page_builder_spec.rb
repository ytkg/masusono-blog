require "rails_helper"

RSpec.describe Admin::ArticlesPageBuilder do
  subject(:result) { described_class.call(articles:, query:, status:, page:) }

  let(:query) { "" }
  let(:status) { "all" }
  let(:page) { 1 }
  let(:articles) do
    [
      { id: "a", title: "Rails 公開", status: "PUBLISH", updated_at: "2026-01-01" },
      { id: "b", title: "RAILS 下書き", status: "DRAFT", updated_at: "2026-02-01" },
      { id: "c", title: "Ruby", status: "CLOSED", updated_at: "2026-02-01" },
      { id: "d", title: "Rails 更新", status: "PUBLISH_AND_DRAFT", updated_at: "2026-01-01" }
    ].map(&:freeze).freeze
  end

  it "更新日時、同日時ではIDの降順に並べ、入力を変更しない" do
    expect(result[:articles].map { |article| article[:id] }).to eq(%w[c b d a])
    expect(articles.map { |article| article[:id] }).to eq(%w[a b c d])
  end

  context "検索語と状態を指定した場合" do
    let(:query) { "rAiLs" }
    let(:status) { "draft" }

    it "大文字小文字を区別せず両条件で絞り込み、指定値を返す" do
      expect(result).to eq(articles: [ articles[1] ], total_count: 1, has_more: false, page: 1, query: "rAiLs", status: "draft")
    end
  end

  { "published" => "a", "draft" => "b", "closed" => "c", "published_and_draft" => "d" }.each do |filter, id|
    context "状態が#{filter}の場合" do
      let(:status) { filter }

      it "対応する状態の記事を返す" do
        expect(result[:articles].map { |article| article[:id] }).to eq([ id ])
      end
    end
  end

  context "検索結果がない場合" do
    let(:query) { "該当なし" }

    it "空の記事一覧と0件を返す" do
      expect(result).to include(articles: [], total_count: 0, has_more: false)
    end
  end

  context "21件の記事がある場合" do
    let(:articles) do
      (1..21).map { |number| { id: format("%02d", number), title: "記事", status: "DRAFT", updated_at: "2026-01-01" } }
    end

    it "先頭20件と次ページの有無を返す" do
      expect(result[:articles].map { |article| article[:id] }).to eq((2..21).to_a.reverse.map { |number| format("%02d", number) })
      expect(result).to include(total_count: 21, has_more: true)
    end

    context "2ページ目の場合" do
      let(:page) { 2 }

      it "残り1件と全体件数を返す" do
        expect(result).to include(articles: [ articles.first ], total_count: 21, has_more: false)
      end
    end

    context "範囲外のページの場合" do
      let(:page) { 3 }

      it "全体件数を保持した空ページを返す" do
        expect(result).to include(articles: [], total_count: 21, has_more: false)
      end
    end
  end
end
