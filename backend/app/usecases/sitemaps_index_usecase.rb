class SitemapsIndexUsecase
  CONTENT_TYPE = "application/xml; charset=utf-8".freeze
  BASE_URL = "https://masusono.com".freeze
  BLOG_ENTRY = { changefreq: "monthly", priority: 0.6 }.freeze

  STATIC_ENTRIES = [
    { path: "/", changefreq: "weekly", priority: 1.0 },
    { path: "/about", changefreq: "monthly", priority: 0.7 },
    { path: "/authors", changefreq: "monthly", priority: 0.6 },
    { path: "/numbers", changefreq: "monthly", priority: 0.5 },
    { path: "/others", changefreq: "monthly", priority: 0.4 }
  ].freeze

  def self.call
    new.call
  end

  def call
    {
      body: build_sitemap_xml(articles: Article.all, authors: Author.all),
      content_type: CONTENT_TYPE,
      status: :ok
    }
  end

  private

  def build_sitemap_xml(articles:, authors:)
    entries = static_entries + author_entries(authors) + article_entries(articles)
    SitemapXmlBuilder.call(entries)
  end

  def static_entries
    STATIC_ENTRIES.map do |entry|
      {
        loc: "#{BASE_URL}#{entry[:path]}",
        changefreq: entry[:changefreq],
        priority: entry[:priority]
      }
    end
  end

  def article_entries(articles)
    articles.filter_map do |article|
      id = article[:id]
      next if id.nil? || id == ""

      {
        loc: "#{BASE_URL}/articles/#{id}",
        lastmod: article[:revisedAt] || article[:updatedAt] || article[:publishedAt],
        changefreq: BLOG_ENTRY[:changefreq],
        priority: BLOG_ENTRY[:priority]
      }
    end
  end

  def author_entries(authors)
    authors.filter_map do |author|
      id = author[:id]
      next if id.nil? || id == ""

      {
        loc: "#{BASE_URL}/authors/#{id}",
        lastmod: author[:revisedAt] || author[:updatedAt] || author[:publishedAt],
        changefreq: "monthly",
        priority: 0.5
      }
    end
  end
end
