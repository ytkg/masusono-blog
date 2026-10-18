require "rails_helper"

RSpec.describe "Sitemaps", type: :request do
  describe "GET /sitemap.xml" do
    let(:articles) do
      Array.new(120) do |index|
        number = index + 1
        {
          id: "post-#{number}",
          publishedAt: "2025-10-05T00:00:00.000Z",
          title: "記事#{number}",
          content: "<p>本文#{number}</p>",
          author: "著者#{number}"
        }
      end
    end

    before do
      allow(Article).to receive(:all).and_return(articles)
      allow(Author).to receive(:all).and_return([])
    end

    it do
      article_count = articles.size

      get "/sitemap.xml"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/xml")
      expect(response.headers["Cache-Control"]).to eq("no-store")
      blog_entry_count = response.body.scan(%r{<loc>https://masusono\.com/articles/[^<]+</loc>}).size
      expect(blog_entry_count).to eq(article_count)
      expect(blog_entry_count).to eq(120)
    end
    context "改訂日時が空文字の場合" do
      let(:articles) { [ { id: "blank-revision", revisedAt: "", updatedAt: "2026-01-01T00:00:00Z" } ] }

      it "更新日時をlastmodへ出力する" do
        get "/sitemap.xml"
        expect(response.body).to include("<lastmod>2026-01-01T00:00:00Z</lastmod>")
        expect(response.headers["Cache-Control"]).to eq("no-store")
      end
    end
    context "取得した記事に同じIDが含まれる場合" do
      let(:articles) { [ { id: "duplicate", title: "最初" }, { id: "duplicate", title: "後" } ] }

      it "同じ記事URLを重複出力しない" do
        get "/sitemap.xml"
        document = Nokogiri::XML(response.body) { |config| config.strict.nonet }
        expect(document.xpath("//*[local-name()='loc']").map(&:text).count("https://masusono.com/articles/duplicate")).to eq(1)
        expect(response.headers["Cache-Control"]).to eq("no-store")
      end
    end
  end
  it "無効な暦日をXMLの日付へ正規化せず、記事とno-storeを維持する" do
    allow(Article).to receive(:all).and_return([ { id: "invalid-date", title: "記事", revisedAt: "2026-02-29T00:00:00Z" } ])
    allow(Author).to receive(:all).and_return([])
    get "/sitemap.xml"
    expect(response).to have_http_status(:ok)
    expect(response.headers["Cache-Control"]).to eq("no-store")
    document = Nokogiri::XML(response.body) { |config| config.strict.nonet }
    expect(response.body).to include("/articles/invalid-date")
    expect(document.xpath("//*[local-name()='lastmod']")).to be_empty
  end
end
