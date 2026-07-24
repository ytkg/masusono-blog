require "rails_helper"

RSpec.describe SitemapsIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:articles) do
      [
        {
          id: "hello-world",
          publishedAt: "2025-10-05T12:34:56+09:00",
          updatedAt: "2025-10-06T12:34:56+09:00",
          revisedAt: "2025-10-07T12:34:56+09:00",
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
    let(:authors) do
      [
        {
          id: "9wgrey2lh3",
          name: "増田",
          revisedAt: "2026-05-15T14:43:32.380Z"
        },
        {
          id: nil,
          name: "IDなし"
        }
      ]
    end

    before do
      allow(Article).to receive(:all).and_return(articles)
      allow(Author).to receive(:all).and_return(authors)
    end

    it "静的ページと記事ページを含むサイトマップXMLを返す" do
      xml = result[:body]

      expect(result[:status]).to eq(:ok)
      expect(result[:content_type]).to eq("application/xml; charset=utf-8")
      expect(xml).to include("<loc>https://masusono.com/</loc>")
      expect(xml).not_to include("<loc>https://masusono.com/blog</loc>")
      expect(xml).to include("<loc>https://masusono.com/authors</loc>")
      expect(xml).to include("<loc>https://masusono.com/authors/9wgrey2lh3</loc>")
      expect(xml).to include("<lastmod>2026-05-15T14:43:32Z</lastmod>")
      expect(xml).not_to include("<loc>https://masusono.com/authors/</loc>")
      expect(xml).to include("<loc>https://masusono.com/numbers</loc>")
      expect(xml).to include("<loc>https://masusono.com/others</loc>")
      expect(xml).not_to include("<loc>https://masusono.com/zukan</loc>")
      expect(xml).not_to include("<loc>https://masusono.com/settings</loc>")
      expect(xml).to include("<loc>https://masusono.com/articles/hello-world</loc>")
      expect(xml).to include("<lastmod>2025-10-07T03:34:56Z</lastmod>")
      expect(xml).to include("<loc>https://masusono.com/articles/broken-date</loc>")
      expect(xml).not_to include("<loc>https://masusono.com/articles/</loc>")

      broken_date_block = xml[/<loc>https:\/\/masusono.com\/articles\/broken-date<\/loc>.*?<\/url>/m]
      expect(broken_date_block).not_to be_nil
      expect(broken_date_block).not_to include("<lastmod>")
    end
  end
end
