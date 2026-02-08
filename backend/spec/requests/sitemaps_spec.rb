require "rails_helper"

RSpec.describe "Sitemaps", type: :request do
  describe "GET /sitemap.xml" do
    let(:articles) do
      Array.new(120) do |index|
        number = index + 1
        {
          id: "post-#{number}",
          publishedDate: "2025-10-05T00:00:00.000Z",
          title: "記事#{number}",
          content: "<p>本文#{number}</p>",
          author: "著者#{number}"
        }
      end
    end

    before do
      allow(Article).to receive(:all).and_return(articles)
    end

    it do
      get "/articles"
      expect(response).to have_http_status(:ok)
      article_count = JSON.parse(response.body).size

      get "/sitemap.xml"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/xml")
      blog_entry_count = response.body.scan(%r{<loc>https://masusono\.com/blog/[^<]+</loc>}).size
      expect(blog_entry_count).to eq(article_count)
      expect(blog_entry_count).to eq(120)
    end
  end
end
