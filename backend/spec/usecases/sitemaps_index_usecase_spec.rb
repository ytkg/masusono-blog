require "rails_helper"

RSpec.describe SitemapsIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:articles) do
      [
        {
          id: "hello-world",
          publishedAt: "2025-10-05T12:34:56+09:00",
          title: "hello world",
          content: "<p>content</p>",
          author: "増田太郎"
        },
        {
          id: "broken-date",
          publishedAt: "invalid-date",
          title: "broken date",
          content: "<p>content</p>",
          author: "増田太郎"
        },
        {
          id: nil,
          publishedAt: "2025-10-05T00:00:00.000Z",
          title: "ignored",
          content: "<p>content</p>",
          author: "増田太郎"
        }
      ]
    end

    before do
      allow(Article).to receive(:all).and_return(articles)
    end

    it "静的ページと記事ページを含むサイトマップXMLを返す" do
      xml = result[:plain]

      expect(result[:status]).to eq(:ok)
      expect(result[:content_type]).to eq("application/xml; charset=utf-8")
      expect(xml).to include("<loc>https://masusono.com/</loc>")
      expect(xml).to include("<loc>https://masusono.com/shop</loc>")
      expect(xml).not_to include("<loc>https://masusono.com/shops</loc>")
      expect(xml).to include("<loc>https://masusono.com/blog/hello-world</loc>")
      expect(xml).to include("<lastmod>2025-10-05T03:34:56Z</lastmod>")
      expect(xml).to include("<loc>https://masusono.com/blog/broken-date</loc>")
      expect(xml).not_to include("<loc>https://masusono.com/blog/</loc>")

      broken_date_block = xml[/<loc>https:\/\/masusono.com\/blog\/broken-date<\/loc>.*?<\/url>/m]
      expect(broken_date_block).not_to be_nil
      expect(broken_date_block).not_to include("<lastmod>")
    end
  end
end
