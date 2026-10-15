require "rails_helper"

RSpec.describe SitemapEntriesBuilder do
  subject(:result) { described_class.call(articles:, authors:, base_url: "https://example.test") }

  let(:articles) do
    [ { id: "revised", revisedAt: "revised", updatedAt: "updated", publishedAt: "published" }, { id: "updated", updatedAt: "updated", publishedAt: "published" }, { id: "published", publishedAt: "published" }, { id: nil }, { id: "" } ]
  end
  let(:authors) { [ { id: "author", updatedAt: "author-date" }, { id: "" } ] }

  it "静的ページ、投稿者、記事の順で項目を作り、IDのない項目を除く" do
    expect(result.map { |entry| entry[:loc] }).to eq(%w[/ /about /authors /numbers /others /authors/author /articles/revised /articles/updated /articles/published].map { |path| "https://example.test#{path}" })
  end

  it "更新日時の優先順位と各種ページの属性を維持する" do
    expect(result.last(3).map { |entry| entry[:lastmod] }).to eq(%w[revised updated published])
    expect(result.last).to include(changefreq: "monthly", priority: 0.6)
    expect(result[5]).to include(lastmod: "author-date", priority: 0.5)
  end
  context "上位の更新日時が空の場合" do
    let(:articles) { [ { id: "article", revisedAt: "", updatedAt: " ", publishedAt: "2026-01-01T00:00:00Z" } ] }
    let(:authors) { [ { id: "author", revisedAt: "", updatedAt: "2026-01-02T00:00:00Z" } ] }

    it "記事・著者とも次に利用できる日時へフォールバックする" do
      expect(result.last(2).pluck(:lastmod)).to eq([ "2026-01-02T00:00:00Z", "2026-01-01T00:00:00Z" ])
    end
  end
  context "同じIDが重複した場合" do
    let(:articles) { [ { id: "same" }, { id: "same" } ] }
    let(:authors) { [ { id: "same" }, { id: "same" } ] }

    it "記事と著者の別URLを維持し、各URLは一度だけ出力する" do
      expect(result.last(2).pluck(:loc)).to eq([ "https://example.test/authors/same", "https://example.test/articles/same" ])
      expect(result).to have_attributes(size: 7)
    end
  end
end
