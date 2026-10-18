require "rails_helper"

RSpec.describe RssXmlBuilder do
  describe ".callの日付の境界値" do
    subject(:result) { described_class.call(
        title: "Feed", link: "https://example.com", description: "Articles",
        feed_url: "https://example.com/feed.xml", items: entries
      ) }

    let(:entries) { [ { title: "Article", link: "https://example.com/articles/date",
          guid: "https://example.com/articles/date", published_at: date } ] }

    [
      [ "nil", nil ],
      [ "空文字", "" ],
      [ "空白文字", "   " ],
      [ "不正な日付文字列", "2026-13-01T00:00:00Z" ],
      [ "存在しない閏日", "2026-02-29T12:00:00Z" ],
      [ "存在しない月末", "2026-04-31T12:00:00Z" ],
      [ "数値", 123 ],
      [ "真偽値", false ],
      [ "配列", [] ],
      [ "ハッシュ", {} ]
    ].each do |label, value|
      context "日付が#{label}の場合" do
        let(:date) { value }

        it "項目を残し、pubDateを省略する" do
          expect(result).to include("https://example.com/articles/date")
          expect(result).not_to include("<pubDate>")
        end
      end
    end

    [
      [ "正のオフセットで前年になる日時", "2026-01-01T00:30:00+09:00", "Wed, 31 Dec 2025 15:30:00 -0000" ],
      [ "負のオフセットで翌年になる日時", "2025-12-31T23:30:00-05:00", "Thu, 01 Jan 2026 04:30:00 -0000" ],
      [ "UTCのうるう日と小数秒を含む日時", "2024-02-29T12:34:56.789Z", "Thu, 29 Feb 2024 12:34:56 -0000" ]
    ].each do |label, value, expected|
      context "#{label}の場合" do
        let(:date) { value }

        it "UTCへ変換してpubDateを出力する" do
          expect(result).to include("<pubDate>#{expected}</pubDate>")
        end
      end
    end
  end
  it "XML 1.0で禁止された制御文字だけを除き、RSS全体を読み取れる" do
    xml = described_class.call(title: "本文\u0000\u000B\uFFFE😊\t\n末尾", link: "https://example.test", description: "Feed",
      feed_url: "https://example.test/feed.xml", items: [])
    document = Nokogiri::XML(xml) { |config| config.strict.nonet }
    expect(document.at_xpath("/rss/channel/title").text).to eq("本文😊\t\n末尾")
  end
end
