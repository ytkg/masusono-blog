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
end
