class SitemapsIndexUsecase
  CONTENT_TYPE = "application/xml; charset=utf-8".freeze
  BASE_URL = "https://masusono.com".freeze
  BLOG_ENTRY = { changefreq: "monthly", priority: 0.6 }.freeze

  STATIC_ENTRIES = [
    { path: "/", changefreq: "weekly", priority: 1.0 },
    { path: "/blog", changefreq: "weekly", priority: 0.8 },
    { path: "/about", changefreq: "monthly", priority: 0.7 },
    { path: "/settings", changefreq: "monthly", priority: 0.4 }
  ].freeze

  def self.call
    new.call
  end

  def call
    {
      body: build_sitemap_xml(Article.all),
      content_type: CONTENT_TYPE,
      status: :ok
    }
  end

  private

  def build_sitemap_xml(articles)
    entries = static_entries + article_entries(articles)
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
        loc: "#{BASE_URL}/blog/#{id}",
        lastmod: article[:publishedAt],
        changefreq: BLOG_ENTRY[:changefreq],
        priority: BLOG_ENTRY[:priority]
      }
    end
  end
end
