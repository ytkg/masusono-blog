require "rails_helper"

RSpec.describe Bookshelf::Candidates do
  def article(id, date, content)
    { id: id, title: id, publishedAt: date, content: content }
  end

  def link(asin, path = "dp")
    %(<a href="https://www.amazon.co.jp/#{path}/#{asin}?tag=test#ref">本</a>)
  end

  it "validates ISBN-10 checksums including X and converts to ISBN-13" do
    expect(Bookshelf::Isbn.from_asin("4101010013")).to eq("9784101010014")
    expect(Bookshelf::Isbn.from_asin("080442957X")).to eq("9780804429573")
    %w[4101010014 B012345678 9784101010014 123456789x].each do |value|
      expect(Bookshelf::Isbn.from_asin(value)).to be_nil
    end
  end

  it "rejects wrong hosts, shortened URLs, malformed paths, Kindle and non-book IDs" do
    html = [ "https://amazon.co.jp.evil/dp/4101010013", "https://evil/amazon.co.jp/dp/4101010013", "https://amzn.to/4101010013", "https://amazon.co.jp/dp/4101010013extra", "https://amazon.co.jp/dp/B012345678", "https://amazon.co.jp/dp/4101010014" ].map { |url| %(<a href="#{url}">本</a>) }.join
    expect(described_class.call([ article("a", "2026-01-01T00:00:00Z", html) ])).to be_empty
  end

  it "deduplicates variants and articles, sorts by first appearance rather than reappearance" do
    articles = [
      article("new", "2026-03-01T00:00:00Z", link("4101010013")),
      article("b", "2026-02-01T00:00:00Z", link("080442957X")),
      article("a", "2026-01-01T00:00:00Z", link("4101010013") + link("4101010013", "gp/product"))
    ]
    books = described_class.call(articles)
    expect(books.pluck(:isbn)).to eq(%w[9780804429573 9784101010014])
    expect(books.last[:appearances].keys).to eq(%w[new a])
    expect(books.last[:amazonUrl]).to eq("https://www.amazon.co.jp/dp/4101010013")
  end

  it "breaks ties by reference article ID and then link order" do
    books = described_class.call([
      article("b", "2026-01-01T00:00:00Z", link("4101010013")),
      article("a", "2026-01-01T00:00:00Z", link("080442957X") + link("4101010013"))
    ])
    expect(books.pluck(:isbn)).to eq(%w[9780804429573 9784101010014])
  end
end
