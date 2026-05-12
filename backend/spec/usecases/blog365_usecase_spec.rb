require "rails_helper"

RSpec.describe Blog365Usecase do
  describe ".call" do
    it "12か月の配下に1月1日から12月31日までの日付見出しを振り分けて返す" do
      allow(Article).to receive(:all).and_return(
        [
          { id: "article-1", title: "元日", publishedAt: "2024-12-31T15:30:00.000Z", content: "<p>本文</p>" },
          { id: "article-2", title: "大晦日", publishedAt: "2025-12-31T12:00:00.000Z", author: { name: "増田" } },
          { id: "article-3", title: "うるう日", publishedAt: "2024-02-29T12:00:00.000Z" }
        ]
      )

      result = described_class.call

      expect(result[:status]).to eq(:ok)
      expect(result[:props][:months].length).to eq(12)

      january = result[:props][:months].first
      december = result[:props][:months].last
      all_days = result[:props][:months].flat_map { |month| month[:days] }

      expect(january[:id]).to eq("01")
      expect(january[:title]).to eq("1月")
      expect(january[:filledDaysCount]).to eq(1)
      expect(january[:totalDaysCount]).to eq(31)
      expect(january[:days].length).to eq(31)
      expect(january[:days].first).to eq(
        { id: "01-01", title: "1月1日", articles: [ { id: "article-1", title: "元日" } ] }
      )

      expect(december[:id]).to eq("12")
      expect(december[:title]).to eq("12月")
      expect(december[:filledDaysCount]).to eq(1)
      expect(december[:totalDaysCount]).to eq(31)
      expect(december[:days].last).to eq(
        { id: "12-31", title: "12月31日", articles: [ { id: "article-2", title: "大晦日" } ] }
      )

      expect(all_days.none? { |day| day[:id] == "02-29" }).to be(true)
    end
  end
end
