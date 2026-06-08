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
    let(:masuda_run_rankings) do
      [
        { id: "ranking-1", createdAt: "2025-10-06T10:00:00.000Z" },
        { id: "ranking-2", createdAt: "2025-10-06T11:00:00.000Z" },
        { id: "ranking-3", createdAt: "2025-10-08T12:00:00.000Z" }
      ]
    end

    before do
      described_class::CACHE.clear
      allow(Date).to receive(:current).and_return(Date.new(2025, 10, 10))
      allow(Article).to receive(:all).and_return(articles)
      allow(MasudaRunRanking).to receive(:all).and_return(masuda_run_rankings)
    end

    let(:blocks) { result[:metrics][:blocks] }
    let(:trend) { result[:metrics][:trend] }

    describe "起算日" do
      it do
        expect(result[:status]).to eq(:ok)
        expect(blocks.first).to eq(
          {
            label: "増田とその他！始動から（2025/10/05〜）",
            value: "5 日"
          }
        )
      end
    end

    describe "記事" do
      it do
        total_articles = blocks.find { |block| block[:label] == "総記事数" }

        expect(total_articles[:value]).to eq("4 本")
        expect(total_articles[:children]).to eq([
          { label: "増田太郎の総記事数", value: "1 本" },
          { label: "その他3の総記事数", value: "1 本" },
          { label: "その他4の総記事数", value: "1 本" },
          { label: "不明の総記事数", value: "1 本" }
        ])
      end

      it do
        total_chars = blocks.find { |block| block[:label] == "総文字数" }

        expect(total_chars[:value]).to eq("12 字")
        expect(total_chars[:children]).to eq([
          { label: "増田太郎の総文字数", value: "3 字" },
          { label: "その他3の総文字数", value: "3 字" },
          { label: "その他4の総文字数", value: "4 字" },
          { label: "不明の総文字数", value: "2 字" }
        ])
      end

      it do
        expect(blocks.map { |block| block[:label] }).to include("総記事数", "総文字数")
        expect(blocks.map { |block| block[:label] }).not_to include("ブログ")
      end
    end

    describe "増田RUN" do
      let(:masuda_run_block) { blocks.find { |block| block[:label] == "増田RUN総プレイ回数" } }

      it do
        expect(masuda_run_block).not_to be_nil
      end

      it do
        expect(blocks.last[:label]).to eq("増田RUN総プレイ回数")
      end

      it do
        expect(masuda_run_block[:value]).to eq("3 回")
      end

      context "総プレイ回数の取得に失敗したとき" do
        before do
          allow(MasudaRunRanking).to receive(:all).and_raise(Faraday::TimeoutError, "execution expired")
        end

        it do
          expect(result[:status]).to eq(:ok)
          expect(masuda_run_block[:value]).to be_nil
        end
      end
    end

    describe "推移" do
      it do
        expect(trend[:title]).to eq("推移")
        expect(trend[:series]).to eq([
          { key: :totalArticles, label: "総記事数", unit: "本", finalValue: "4 本" },
          { key: :totalChars, label: "総文字数", unit: "字", finalValue: "12 字" },
          { key: :masudaRunTotalPlays, label: "増田RUN総プレイ回数", unit: "回", finalValue: "3 回" }
        ])
      end

      it do
        expect(trend[:points]).to eq([
          { date: "2025-10-05", label: "2025/10/05", totalArticles: 1, totalChars: 3, masudaRunTotalPlays: 0 },
          { date: "2025-10-06", label: "2025/10/06", totalArticles: 2, totalChars: 5, masudaRunTotalPlays: 2 },
          { date: "2025-10-07", label: "2025/10/07", totalArticles: 3, totalChars: 9, masudaRunTotalPlays: 2 },
          { date: "2025-10-08", label: "2025/10/08", totalArticles: 4, totalChars: 12, masudaRunTotalPlays: 3 },
          { date: "2025-10-09", label: "2025/10/09", totalArticles: 4, totalChars: 12, masudaRunTotalPlays: 3 },
          { date: "2025-10-10", label: "2025/10/10", totalArticles: 4, totalChars: 12, masudaRunTotalPlays: 3 }
        ])
      end
    end
  end
end
