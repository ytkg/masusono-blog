require "rails_helper"

RSpec.describe RssArticleItemsBuilder do
  subject(:result) { described_class.call(articles:, site_url: "https://example.test") }

  let(:articles) do
    [ { id: "article", title: "記事", content: "<p>本文</p>", publishedAt: "invalid-date", author: { name: "  増田  " } }, { id: nil }, { id: "" } ]
  end

  it "IDのない記事を除き、本文と日時をXML生成側へ渡す" do
    expect(result).to eq([
      { title: "記事", link: "https://example.test/articles/article", guid: "https://example.test/articles/article", published_at: "invalid-date", description: "<p>本文</p>", author: "増田" }
    ])
  end

  context "投稿者がない場合" do
    let(:articles) { [ { id: "article" } ] }

    it "空の投稿者名を返す" do
      expect(result.first[:author]).to eq("")
    end
  end
end
