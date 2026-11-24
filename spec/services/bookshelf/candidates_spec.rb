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
    html = [ "https://amazon.co.jp/%ZZ", "https://user@amazon.co.jp/dp/4101010013", "https://amazon.co.jp.evil/dp/4101010013", "https://evil/amazon.co.jp/dp/4101010013", "https://amzn.to/4101010013", "https://amazon.co.jp/dp/4101010013extra", "https://amazon.co.jp/dp/B012345678", "https://amazon.co.jp/dp/4101010014" ].map { |url| %(<a href="#{url}">本</a>) }.join
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

  it "rejects credentials, unsupported schemes and malformed URIs" do
    urls = [
      "https://user:password@amazon.co.jp/dp/4101010013",
      "ftp://amazon.co.jp/dp/4101010013",
      "//amazon.co.jp/dp/4101010013",
      "https://amazon.co.jp/dp/4101010013%ZZ"
    ]

    urls.each do |url|
      html = %(<a href="#{url}">本</a>)
      expect(described_class.call([ article("a", "2026-01-01T00:00:00Z", html) ])).to be_empty
    end
  end

  it "accepts HTTP, case-insensitive hosts and a trailing product path" do
    html = %(<a href="http://AMAZON.CO.JP/gp/product/4101010013/ref=test">本</a>)

    book = described_class.call([ article("a", "2026-01-01T00:00:00Z", html) ]).sole

    expect(book[:isbn]).to eq("9784101010014")
    expect(book[:amazonUrl]).to eq("https://www.amazon.co.jp/dp/4101010013")
  end

  it "skips articles without IDs or content and anchors without hrefs" do
    articles = [ nil, "", " " ].map { |id| article(id, "2026-01-01T00:00:00Z", link("4101010013")) }
    articles << article("no-content", "2026-01-01T00:00:00Z", nil)
    articles << article("no-href", "2026-01-01T00:00:00Z", "<a>本</a>")

    expect(described_class.call(articles)).to be_empty
  end

  it "compares first appearances by instant across time zones" do
    books = described_class.call([
      article("earlier", "2026-01-01T00:30:00+09:00", link("4101010013")),
      article("later", "2025-12-31T16:00:00Z", link("4101010013") + link("080442957X"))
    ])

    expect(books.pluck(:isbn)).to eq(%w[9780804429573 9784101010014])
    expect(books.last[:first][:id]).to eq("earlier")
  end

  it "breaks ties by reference article ID and then link order" do
    books = described_class.call([
      article("b", "2026-01-01T00:00:00Z", link("4101010013")),
      article("a", "2026-01-01T00:00:00Z", link("080442957X") + link("4101010013"))
    ])
    expect(books.pluck(:isbn)).to eq(%w[9780804429573 9784101010014])
  end

  it "skips invalid publication dates without rolling them into the next month" do
    invalid_dates = [ "2026-02-29T00:00:00Z", "2026-04-31T00:00:00Z", "invalid", nil, "", 123 ]
    articles = invalid_dates.each_with_index.map { |date, index| article("invalid-#{index}", date, link("4101010013")) }
    articles << article("leap-day", "2024-02-29T23:00:00+09:00", link("4101010013"))
    articles << article("valid", "2026-03-01T00:00:00Z", link("4101010013"))

    book = described_class.call(articles).sole
    expect(book[:appearances].keys).to eq(%w[leap-day valid])
    expect(book[:first][:id]).to eq("leap-day")
    expect(book[:appearances]["leap-day"][:publishedAt]).to eq("2024-02-29T23:00:00+09:00")
  end
end
