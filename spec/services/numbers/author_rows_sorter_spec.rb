require "rails_helper"

RSpec.describe Numbers::AuthorRowsSorter do
  subject(:result) { described_class.call(authors:) }

  let(:authors) do
    { "その他10" => { articles: 10 }, "その他2" => { articles: 2 }, "その他1" => { articles: 1 }, "増田10" => { articles: 3 }, "増田2" => { articles: 4 } }.freeze
  end

  it "増田を優先し、名前の数字を数値順に並べる" do
    expect(result.map(&:first)).to eq(%w[増田2 増田10 その他1 その他2 その他10])
    expect(result.assoc("その他10").last).to eq(articles: 10)
  end

  context "投稿者がいない場合" do
    let(:authors) { {} }

    it "空の一覧を返す" do
      expect(result).to eq([])
    end
  end
end
