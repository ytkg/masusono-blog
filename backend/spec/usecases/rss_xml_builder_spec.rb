require "rails_helper"

RSpec.describe RssXmlBuilder do
  describe ".callの日付の境界値" do
    subject(:result) { described_class.call(
        title: "Feed", link: "https://example.com", description: "Articles",
        feed_url: "https://example.com/feed.xml", items: entries
      ) }

    let(:entries) { [ { title: "Article", link: "https://example.com/articles/date",
          guid: "https://example.com/articles/date", published_at: date } ] }

    context "日付がnilの場合" do
      let(:date) { nil }

      it "項目を残し、pubDateを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<pubDate>")
      end
    end

    context "日付が空文字の場合" do
      let(:date) { "" }

      it "項目を残し、pubDateを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<pubDate>")
      end
    end

    context "日付が空白文字の場合" do
      let(:date) { "   " }

      it "項目を残し、pubDateを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<pubDate>")
      end
    end

    context "日付が不正な日付文字列の場合" do
      let(:date) { "2026-13-01T00:00:00Z" }

      it "項目を残し、pubDateを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<pubDate>")
      end
    end

    context "日付が数値の場合" do
      let(:date) { 123 }

      it "項目を残し、pubDateを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<pubDate>")
      end
    end

    context "日付が真偽値の場合" do
      let(:date) { false }

      it "項目を残し、pubDateを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<pubDate>")
      end
    end

    context "日付が配列の場合" do
      let(:date) { [] }

      it "項目を残し、pubDateを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<pubDate>")
      end
    end

    context "日付がハッシュの場合" do
      let(:date) { {} }

      it "項目を残し、pubDateを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<pubDate>")
      end
    end

    context "正のオフセットで前年になる日時の場合" do
      let(:date) { "2026-01-01T00:30:00+09:00" }

      it "UTCへ変換してpubDateを出力する" do
        expect(result).to include("<pubDate>Wed, 31 Dec 2025 15:30:00 -0000</pubDate>")
      end
    end

    context "負のオフセットで翌年になる日時の場合" do
      let(:date) { "2025-12-31T23:30:00-05:00" }

      it "UTCへ変換してpubDateを出力する" do
        expect(result).to include("<pubDate>Thu, 01 Jan 2026 04:30:00 -0000</pubDate>")
      end
    end

    context "UTCのうるう日と小数秒を含む日時の場合" do
      let(:date) { "2024-02-29T12:34:56.789Z" }

      it "UTCへ変換してpubDateを出力する" do
        expect(result).to include("<pubDate>Thu, 29 Feb 2024 12:34:56 -0000</pubDate>")
      end
    end
  end
end
