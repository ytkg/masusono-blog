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
end
