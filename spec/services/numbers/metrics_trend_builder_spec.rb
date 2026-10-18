require "rails_helper"

RSpec.describe Numbers::MetricsTrendBuilder do
  include ActiveSupport::Testing::TimeHelpers

  describe ".call" do
    subject(:result) { described_class.call(articles:, start_date:, end_date:) }

    let(:start_date) { Date.new(2025, 10, 5) }
    let(:end_date) { Date.new(2025, 10, 6) }

    context "JSTの日付境界をまたぐ場合" do
      let(:articles) do
        [
          { publishedAt: "2025-10-05T14:59:59Z", content: "a" },
          { publishedAt: "2025-10-05T15:00:00Z", content: "bc" },
          { publishedAt: "2025-10-06T08:59:59+09:00", content: "def" }
        ]
      end

      it "公開日時をJSTの日付ごとに累積し移動平均を返す" do
        expect(result.fetch(:points)).to eq([
          { date: "2025-10-05", label: "2025/10/05", totalArticles: 1, totalChars: 1, actualValues: { totalArticles: 1, totalChars: 1 } },
          { date: "2025-10-06", label: "2025/10/06", totalArticles: 2, totalChars: 3.5, actualValues: { totalArticles: 3, totalChars: 6 } }
        ])
      end
    end

    context "終了日を省略した場合" do
      subject(:result) { described_class.call(articles:, start_date:) }

      let(:articles) { [] }

      it "JSTの午前0時に当日までのグラフを作る" do
        travel_to(Time.iso8601("2025-10-05T15:00:00Z")) do
          expect(result.fetch(:points).last.fetch(:date)).to eq("2025-10-06")
        end
      end
    end

    context "対象記事がない場合" do
      let(:articles) { [] }

      it do
        expect(result).to include(
          series: [
            { key: :totalArticles, label: "総記事数", unit: "本", finalValue: "0 本" },
            { key: :totalChars, label: "総文字数", unit: "字", finalValue: "0 字" }
          ],
          points: [
            { date: "2025-10-05", label: "2025/10/05", totalArticles: 0, totalChars: 0, actualValues: { totalArticles: 0, totalChars: 0 } },
            { date: "2025-10-06", label: "2025/10/06", totalArticles: 0, totalChars: 0, actualValues: { totalArticles: 0, totalChars: 0 } }
          ]
        )
      end
    end

    context "終了日が開始日より前で記事がない場合" do
      let(:articles) { [] }
      let(:end_date) { start_date - 1 }

      it "空のポイントとゼロの最終値を返す" do
        expect(result.fetch(:points)).to eq([])
        expect(result.fetch(:series).pluck(:finalValue)).to eq([ "0 本", "0 字" ])
      end
    end

    context "終了日より後の記事がある場合" do
      let(:articles) do
        [
          { publishedAt: "2025-10-05T10:00:00+09:00", content: "<p>abc</p>" },
          { publishedDate: "2025/10/08", content: "de" },
          { publishedAt: "invalid", content: "ignored" }
        ]
      end

      it do
        expect(result.fetch(:points)).to eq([
          { date: "2025-10-05", label: "2025/10/05", totalArticles: 1, totalChars: 3, actualValues: { totalArticles: 1, totalChars: 3 } },
          { date: "2025-10-06", label: "2025/10/06", totalArticles: 1, totalChars: 3, actualValues: { totalArticles: 1, totalChars: 3 } },
          { date: "2025-10-07", label: "2025/10/07", totalArticles: 1, totalChars: 3, actualValues: { totalArticles: 1, totalChars: 3 } },
          { date: "2025-10-08", label: "2025/10/08", totalArticles: 1.25, totalChars: 3.5, actualValues: { totalArticles: 2, totalChars: 5 } }
        ])
      end
    end
  end
  it "表示開始日前の記事も累積の初期値に含める" do
    result = described_class.call(
      articles: [ { publishedAt: "2025-10-04T00:00:00Z", content: "abc" }, { publishedAt: "2025-10-06T00:00:00Z", content: "de" } ],
      start_date: Date.new(2025, 10, 5), end_date: Date.new(2025, 10, 6))
    expect(result.fetch(:points).pluck(:totalArticles)).to eq([ 1, 1.5 ])
    expect(result.fetch(:points).pluck(:totalChars)).to eq([ 3, 4 ])
    expect(result.fetch(:series).pluck(:finalValue)).to eq([ "2 本", "5 字" ])
  end
  it "直近7日分の累積値を平均し、8日目には最初の日を除外する" do
    result = described_class.call(
      articles: [
        { publishedAt: "2025-10-05T00:00:00Z", content: "abcdefg" },
        { publishedAt: "2025-10-06T00:00:00Z", content: "abcdefg" }
      ],
      start_date: Date.new(2025, 10, 5), end_date: Date.new(2025, 10, 13))
    points = result.fetch(:points)
    expect(points.first.fetch(:totalArticles)).to eq(1)
    expect(points[6].fetch(:totalArticles)).to eq(13 / 7.0)
    expect(points[7].fetch(:totalArticles)).to eq(2)
    expect(points[7].fetch(:totalChars)).to eq(14)
    expect(points.last.fetch(:totalArticles)).to eq(2)
  end
  it "存在しない暦日の記事を翌月へ丸めて集計しない" do
    result = described_class.call(
      articles: [
        { publishedAt: "2026-02-29T00:00:00Z", content: "invalid" },
        { publishedDate: "2026/02/30", content: "invalid" },
        { publishedAt: "2024-02-29T00:00:00Z", content: "ok" },
        { publishedDate: Date.new(2026, 3, 1), content: "valid" }
      ], start_date: Date.new(2026, 3, 1), end_date: Date.new(2026, 3, 1))
    expect(result.fetch(:series).pluck(:finalValue)).to eq([ "2 本", "7 字" ])
  end
end
