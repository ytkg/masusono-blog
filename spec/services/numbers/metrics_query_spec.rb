require "rails_helper"

RSpec.describe Numbers::MetricsQuery do
  include ActiveSupport::Testing::TimeHelpers
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

    it "分布を集計・推移と同じ1時間キャッシュで更新する" do
      first = described_class.call
      articles << { content: "あ" * 200, publishedDate: "2025/10/09" }
      expect(described_class.call).to eq(first)
      travel 1.hour + 1.second do
        refreshed = described_class.call[:metrics]
        expect(refreshed[:distribution].sum { |bucket| bucket[:articles] }).to eq(5)
        expect(refreshed[:rows].first[:articles]).to eq("5 本")
        expect(refreshed[:trend][:series].first[:finalValue]).to eq("5 本")
      end
    end

    describe "文字数の分布" do
      it "集計と同じ文字数で0本の区間も返す" do
        buckets = result[:metrics][:distribution]
        expect(buckets.size).to eq(11)
        expect(buckets.first).to eq(minChars: 0, maxChars: 199, articles: 4)
        expect(buckets.last).to eq(minChars: 2000, maxChars: nil, articles: 0)
        expect(buckets.sum { |bucket| bucket[:articles] }).to eq(4)
      end

      context "各境界と上限を超える本文の場合" do
        let(:articles) do
          lengths = [ 0, *((1..10).flat_map { |index| [ index * 200 - 1, index * 200 ] }), 9000 ]
          lengths.map { |length| { content: "あ" * length } }
        end

        it "各記事をちょうど1区間に計上する" do
          expect(result[:metrics][:distribution].map { |bucket| bucket[:articles] }).to eq(Array.new(11, 2))
          expect(rows.first[:articles]).to eq("22 本")
        end
      end

      context "記事がない場合" do
        let(:articles) { [] }

        it "全区間0本を返す" do
          expect(result[:metrics][:distribution].map { |bucket| bucket[:articles] }).to eq(Array.new(11, 0))
        end
      end

      it "取得失敗を空の分布に変換しない" do
        allow(Article).to receive(:all).and_raise(StandardError, "upstream failure")
        expect { result }.to raise_error(StandardError, "upstream failure")
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
          { date: "2025-10-05", label: "2025/10/05", totalArticles: 1, totalChars: 3, actualValues: { totalArticles: 1, totalChars: 3 } },
          { date: "2025-10-06", label: "2025/10/06", totalArticles: 1.5, totalChars: 4, actualValues: { totalArticles: 2, totalChars: 5 } },
          { date: "2025-10-07", label: "2025/10/07", totalArticles: 2, totalChars: 17 / 3.0, actualValues: { totalArticles: 3, totalChars: 9 } },
          { date: "2025-10-08", label: "2025/10/08", totalArticles: 2.5, totalChars: 7.25, actualValues: { totalArticles: 4, totalChars: 12 } },
          { date: "2025-10-09", label: "2025/10/09", totalArticles: 2.8, totalChars: 8.2, actualValues: { totalArticles: 4, totalChars: 12 } },
          { date: "2025-10-10", label: "2025/10/10", totalArticles: 3, totalChars: 53 / 6.0, actualValues: { totalArticles: 4, totalChars: 12 } }
        ])
      end
    end
  end
end
