require "rails_helper"

RSpec.describe "Feeds", type: :request do
  describe "GET /feed.xml" do
    let(:articles) do
      Array.new(120) do |index|
        number = index + 1
        {
          id: "post-#{number}",
          publishedAt: "2025-10-05T00:00:00.000Z",
          title: "記事#{number}",
          content: "<p>本文#{number}</p>",
          author: { name: "著者#{number}" }
        }
      end
    end

    before do
      allow(Article).to receive(:all).and_return(articles)
    end

    it do
      article_count = articles.size

      get "/feed.xml"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/rss+xml")
      expect(response.headers["Cache-Control"]).to eq("no-store")
      blog_item_count = response.body.scan(%r{<guid isPermaLink="true">https://masusono\.com/articles/[^<]+</guid>}).size
      expect(blog_item_count).to eq(article_count)
      expect(blog_item_count).to eq(120)
      expect(response.body).to include("<title>増田とその他！</title>")
      expect(response.body).to include("<link>https://masusono.com</link>")
      expect(response.body).to include('<atom:link href="https://masusono.com/feed.xml" rel="self" type="application/rss+xml" />')
    end

    it "任意の Origin から取得できる CORS ヘッダーを返す" do
      get "/feed.xml", headers: { "Origin" => "https://example.com" }

      expect(response).to have_http_status(:ok)
      expect(response.headers["Access-Control-Allow-Origin"]).to eq("*")
    end
    context "取得した記事に同じIDが含まれる場合" do
      let(:articles) { [ { id: "duplicate", title: "最初" }, { id: "duplicate", title: "後" } ] }

      it "同じ記事URLを重複出力しない" do
        get "/feed.xml"
        document = Nokogiri::XML(response.body) { |config| config.strict.nonet }
        expect(document.xpath("//*[local-name()='guid']").map(&:text).count("https://masusono.com/articles/duplicate")).to eq(1)
        expect(response.headers["Cache-Control"]).to eq("no-store")
      end
    end
  end
end
