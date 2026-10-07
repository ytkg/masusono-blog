class SitemapEntriesBuilder
  BLOG_ENTRY = { changefreq: "monthly", priority: 0.6 }.freeze

  STATIC_ENTRIES = [
    { path: "/", changefreq: "weekly", priority: 1.0 },
    { path: "/about", changefreq: "monthly", priority: 0.7 },
    { path: "/authors", changefreq: "monthly", priority: 0.6 },
    { path: "/numbers", changefreq: "monthly", priority: 0.5 },
    { path: "/others", changefreq: "monthly", priority: 0.4 }
  ].freeze

  def self.call(articles:, authors:, base_url:)
    new(base_url:).call(articles:, authors:)
  end

  def initialize(base_url:)
    @base_url = base_url
  end

  def call(articles:, authors:)
    static_entries + author_entries(authors) + article_entries(articles)
  end

  private

  attr_reader :base_url

  def static_entries
    STATIC_ENTRIES.map do |entry|
      {
        loc: "#{base_url}#{entry[:path]}",
        changefreq: entry[:changefreq],
        priority: entry[:priority]
      }
    end
  end

  def article_entries(articles)
    articles.filter_map do |article|
      content_entry(article, section: "articles", changefreq: BLOG_ENTRY[:changefreq], priority: BLOG_ENTRY[:priority])
    end
  end

  def author_entries(authors)
    authors.filter_map do |author|
      content_entry(author, section: "authors", changefreq: "monthly", priority: 0.5)
    end
  end

  def content_entry(content, section:, changefreq:, priority:)
    id = content[:id]
    return if id.nil? || id == ""

    {
      loc: "#{base_url}/#{section}/#{id}",
      lastmod: content[:revisedAt] || content[:updatedAt] || content[:publishedAt],
      changefreq:,
      priority:
    }
  end
end
