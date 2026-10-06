require "rails_helper"

RSpec.describe SitemapXmlBuilder do
  describe ".call" do
    subject(:xml) { described_class.call(entries) }

    let(:entries) do
      [
        {
          loc: "https://masusono.com/articles/hello-world",
          lastmod: "2025-10-05T12:34:56+09:00",
          changefreq: "monthly",
          priority: 0.6
        },
        {
          loc: "https://masusono.com/articles/broken-date",
          lastmod: "invalid-date",
          changefreq: "monthly",
          priority: 0.6
        }
      ]
    end

    it "XMLを生成し、妥当な日付のみlastmodを含める" do
      expect(xml).to include('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
      expect(xml).to include("<loc>https://masusono.com/articles/hello-world</loc>")
      expect(xml).to include("<lastmod>2025-10-05T03:34:56Z</lastmod>")

      broken_date_block = xml[/<loc>https:\/\/masusono.com\/articles\/broken-date<\/loc>.*?<\/url>/m]
      expect(broken_date_block).not_to be_nil
      expect(broken_date_block).not_to include("<lastmod>")
    end
  end

  describe ".callの日付の境界値" do
    subject(:result) { described_class.call(entries) }

    let(:entries) { [ { loc: "https://example.com/articles/date", lastmod: date } ] }

    context "日付がnilの場合" do
      let(:date) { nil }

      it "項目を残し、lastmodを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<lastmod>")
      end
    end

    context "日付が空文字の場合" do
      let(:date) { "" }

      it "項目を残し、lastmodを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<lastmod>")
      end
    end

    context "日付が空白文字の場合" do
      let(:date) { "   " }

      it "項目を残し、lastmodを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<lastmod>")
      end
    end

    context "日付が不正な日付文字列の場合" do
      let(:date) { "2026-13-01T00:00:00Z" }

      it "項目を残し、lastmodを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<lastmod>")
      end
    end

    context "日付が数値の場合" do
      let(:date) { 123 }

      it "項目を残し、lastmodを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<lastmod>")
      end
    end

    context "日付が真偽値の場合" do
      let(:date) { false }

      it "項目を残し、lastmodを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<lastmod>")
      end
    end

    context "日付が配列の場合" do
      let(:date) { [] }

      it "項目を残し、lastmodを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<lastmod>")
      end
    end

    context "日付がハッシュの場合" do
      let(:date) { {} }

      it "項目を残し、lastmodを省略する" do
        expect(result).to include("https://example.com/articles/date")
        expect(result).not_to include("<lastmod>")
      end
    end

    context "正のオフセットで前年になる日時の場合" do
      let(:date) { "2026-01-01T00:30:00+09:00" }

      it "UTCへ変換してlastmodを出力する" do
        expect(result).to include("<lastmod>2025-12-31T15:30:00Z</lastmod>")
      end
    end

    context "負のオフセットで翌年になる日時の場合" do
      let(:date) { "2025-12-31T23:30:00-05:00" }

      it "UTCへ変換してlastmodを出力する" do
        expect(result).to include("<lastmod>2026-01-01T04:30:00Z</lastmod>")
      end
    end

    context "UTCのうるう日と小数秒を含む日時の場合" do
      let(:date) { "2024-02-29T12:34:56.789Z" }

      it "UTCへ変換してlastmodを出力する" do
        expect(result).to include("<lastmod>2024-02-29T12:34:56Z</lastmod>")
      end
    end
  end
end
