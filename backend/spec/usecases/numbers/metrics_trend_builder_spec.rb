require "rails_helper"

RSpec.describe Numbers::MetricsTrendBuilder do
  describe ".call" do
    subject(:result) { described_class.call(articles:, start_date:, end_date:) }

    let(:start_date) { Date.new(2025, 10, 5) }
    let(:end_date) { Date.new(2025, 10, 6) }

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
