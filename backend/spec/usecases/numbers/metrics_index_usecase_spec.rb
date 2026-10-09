require "rails_helper"

RSpec.describe Numbers::MetricsIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:articles) do
      [
        {
          id: "first",
          publishedDate: "2025/10/05",
          title: "first title",
          content: "<p>abc</p>",
          author: "増田太郎"
        },
        {
          id: "second",
          publishedDate: "2025/10/06",
          title: "second title",
          content: "de",
          author: nil
        },
        {
          id: "third",
          publishedDate: "2025/10/07",
          title: "third title",
          content: "fghi",
          author: "その他4"
        },
        {
          id: "fourth",
          publishedDate: "2025/10/08",
          title: "fourth title",
          content: "jkl",
          author: "その他3"
        }
      ]
    end
    before do
      described_class::CACHE.clear
      allow(Date).to receive(:current).and_return(Date.new(2025, 10, 10))
      allow(Article).to receive(:all).and_return(articles)
    end

    let(:rows) { result[:metrics][:rows] }
    let(:trend) { result[:metrics][:trend] }

    it "全体を先頭に著者順で記事の指標を返す" do
      expect(result[:status]).to eq(:ok)
      expect(rows).to eq([
        { label: "全体", articles: "4 本", chars: "12 字", averageChars: "3 字" },
        { label: "増田太郎", articles: "1 本", chars: "3 字", averageChars: "3 字" },
        { label: "その他3", articles: "1 本", chars: "3 字", averageChars: "3 字" },
        { label: "その他4", articles: "1 本", chars: "4 字", averageChars: "4 字" },
        { label: "不明", articles: "1 本", chars: "2 字", averageChars: "2 字" }
      ])
    end

    context "空の本文の記事もある場合" do
      let(:articles) do
        [
          { content: "<p>a b c</p>", author: "増田" },
          { content: nil, author: "増田" },
          { content: "<p>de</p>", author: "その他" }
        ]
      end

      it "空の本文も分母に含める" do
        expect(rows.map { |row| row[:averageChars] }).to eq([ "2 字", "2 字", "2 字" ])
      end
    end

    context "記事がない場合" do
      let(:articles) { [] }

      it "全体だけを表示する" do
        expect(rows).to eq([ { label: "全体", articles: "0 本", chars: "0 字", averageChars: "—" } ])
      end
    end

    describe "推移" do
      it do
        expect(trend[:title]).to eq("推移")
        expect(trend[:series]).to eq([
          { key: :totalArticles, label: "総記事数", unit: "本", finalValue: "4 本" },
          { key: :totalChars, label: "総文字数", unit: "字", finalValue: "12 字" }
        ])
      end

      it do
        expect(trend[:points]).to eq([
          { date: "2025-10-05", label: "2025/10/05", totalArticles: 1, totalChars: 3 },
          { date: "2025-10-06", label: "2025/10/06", totalArticles: 2, totalChars: 5 },
          { date: "2025-10-07", label: "2025/10/07", totalArticles: 3, totalChars: 9 },
          { date: "2025-10-08", label: "2025/10/08", totalArticles: 4, totalChars: 12 },
          { date: "2025-10-09", label: "2025/10/09", totalArticles: 4, totalChars: 12 },
          { date: "2025-10-10", label: "2025/10/10", totalArticles: 4, totalChars: 12 }
        ])
      end
    end
  end
end
