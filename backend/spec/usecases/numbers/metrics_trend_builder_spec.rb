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

      it "公開日時をJSTの日付ごとに累積する" do
        expect(result.fetch(:points)).to eq([
          { date: "2025-10-05", label: "2025/10/05", totalArticles: 1, totalChars: 1 },
          { date: "2025-10-06", label: "2025/10/06", totalArticles: 3, totalChars: 6 }
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
            { date: "2025-10-05", label: "2025/10/05", totalArticles: 0, totalChars: 0 },
            { date: "2025-10-06", label: "2025/10/06", totalArticles: 0, totalChars: 0 }
          ]
        )
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
          { date: "2025-10-05", label: "2025/10/05", totalArticles: 1, totalChars: 3 },
          { date: "2025-10-06", label: "2025/10/06", totalArticles: 1, totalChars: 3 },
          { date: "2025-10-07", label: "2025/10/07", totalArticles: 1, totalChars: 3 },
          { date: "2025-10-08", label: "2025/10/08", totalArticles: 2, totalChars: 5 }
        ])
      end
    end
  end
end
