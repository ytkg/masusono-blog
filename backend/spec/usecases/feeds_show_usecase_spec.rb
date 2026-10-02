require "rails_helper"

RSpec.describe FeedsShowUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    before do
      articles = [
        {
          id: "hello-world",
          publishedAt: "2025-10-05T12:34:56+09:00",
          title: "hello & world",
          content: "<p>content & body</p>",
          author: { name: "増田太郎" }
        },
        {
          id: "broken-date",
          publishedAt: "invalid-date",
          title: "broken date",
          content: "<p>content</p>",
          author: "その他花子"
        },
        {
          id: nil,
          publishedAt: "2025-10-05T00:00:00.000Z",
          title: "ignored",
          content: "<p>content</p>",
          author: "増田太郎"
        }
      ]

      allow(Article).to receive(:all).and_return(articles)
    end

    it do
      xml = result[:body]

      expect(result[:status]).to eq(:ok)
      expect(result[:content_type]).to eq("application/rss+xml; charset=utf-8")
      expect(xml).to include('<rss version="2.0"')
      expect(xml).to include("<title>増田とその他！</title>")
      expect(xml).to include("<link>https://masusono.com</link>")
      expect(xml).to include("<title>hello &amp; world</title>")
      expect(xml).to include("<link>https://masusono.com/articles/hello-world</link>")
      expect(xml).to include("<guid isPermaLink=\"true\">https://masusono.com/articles/hello-world</guid>")
      expect(xml).to include("<pubDate>Sun, 05 Oct 2025 03:34:56 -0000</pubDate>")
      expect(xml).to include("<description>&lt;p&gt;content &amp; body&lt;/p&gt;</description>")
      expect(xml).to include("<dc:creator>増田太郎</dc:creator>")
      expect(xml).to include("<link>https://masusono.com/articles/broken-date</link>")
      expect(xml).not_to include("<link>https://masusono.com/articles/</link>")

      broken_date_block = xml[/<link>https:\/\/masusono.com\/articles\/broken-date<\/link>.*?<\/item>/m]
      expect(broken_date_block).not_to be_nil
      expect(broken_date_block).not_to include("<pubDate>")
    end
  end
end
