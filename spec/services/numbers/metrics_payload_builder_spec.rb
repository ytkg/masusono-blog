require "rails_helper"

RSpec.describe Numbers::MetricsPayloadBuilder do
  subject(:result) { described_class.call(article_summary:) }

  let(:article_summary) do
    {
      totals: { articles: 1_234, chars: 56_789 },
      author_rows: [ [ "増田", { articles: 1_000, chars: 45_678 } ], [ "その他", { articles: 234, chars: 11_111 } ] ]
    }
  end

  it "全体と著者別の指標を行として返す" do
    expect(result).to eq(rows: [
      { label: "全体", articles: "1,234 本", chars: "56,789 字", averageChars: "46 字" },
      { label: "増田", articles: "1,000 本", chars: "45,678 字", averageChars: "46 字" },
      { label: "その他", articles: "234 本", chars: "11,111 字", averageChars: "47 字" }
    ])
  end

  context "平均に端数がある場合" do
    let(:article_summary) { { totals: { articles: 2, chars: 2_469 }, author_rows: [ [ "増田", { articles: 2, chars: 2_469 } ] ] } }

    it "四捨五入して桁区切りで表示する" do
      expect(result[:rows].map { |row| row[:averageChars] }).to eq([ "1,235 字", "1,235 字" ])
    end
  end

  context "記事数が0件の場合" do
    let(:article_summary) { { totals: { articles: 0, chars: 0 }, author_rows: [ [ "増田", { articles: 0, chars: 0 } ] ] } }

    it "全体と著者別の平均をダッシュで表示する" do
      expect(result[:rows].map { |row| row[:averageChars] }).to eq([ "—", "—" ])
    end
  end

  context "本文の文字数が0の場合" do
    let(:article_summary) { { totals: { articles: 1, chars: 0 }, author_rows: [] } }

    it "平均を0字で表示する" do
      expect(result[:rows].first[:averageChars]).to eq("0 字")
    end
  end
end
