require "time"

class SitemapsIndexUsecase
  CONTENT_TYPE = "application/xml; charset=utf-8".freeze
  BASE_URL = "https://masusono.com".freeze
  BLOG_ENTRY = { changefreq: "monthly", priority: 0.6 }.freeze

  STATIC_ENTRIES = [
    { path: "/", changefreq: "weekly", priority: 1.0 },
    { path: "/blog", changefreq: "weekly", priority: 0.8 },
    { path: "/about", changefreq: "monthly", priority: 0.7 },
    { path: "/podcast", changefreq: "weekly", priority: 0.8 },
    { path: "/shops", changefreq: "weekly", priority: 0.8 }
  ].freeze

  def self.call
    new.call
  end

  def call
    { xml: build_sitemap_xml(Article.all), content_type: CONTENT_TYPE }
  end

  private

  def build_sitemap_xml(articles)
    entries = static_entries + article_entries(articles)
    serialize_entries(entries)
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
      id = article["id"]
      next if id.nil? || id == ""

      {
        loc: "#{BASE_URL}/blog/#{id}",
        lastmod: article["publishedAt"],
        changefreq: BLOG_ENTRY[:changefreq],
        priority: BLOG_ENTRY[:priority]
      }
    end
  end

  def serialize_entries(entries)
    lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    entries.each do |entry|
      lines << "  <url>"
      lines << "    <loc>#{escape_xml(entry[:loc])}</loc>"
      lastmod = normalize_date(entry[:lastmod])
      lines << "    <lastmod>#{escape_xml(lastmod)}</lastmod>" if lastmod
      lines << "    <changefreq>#{escape_xml(entry[:changefreq])}</changefreq>" if entry[:changefreq]
      lines << "    <priority>#{format('%.1f', entry[:priority])}</priority>" if entry[:priority] != nil
      lines << "  </url>"
    end

    lines << "</urlset>"
    "#{lines.join("\n")}\n"
  end

  def escape_xml(value)
    value.to_s
      .gsub("&", "&amp;")
      .gsub("<", "&lt;")
      .gsub(">", "&gt;")
      .gsub('"', "&quot;")
      .gsub("'", "&apos;")
  end

  def normalize_date(value)
    return nil if value.nil? || value == ""

    time = Time.parse(value)
    time.utc.iso8601
  rescue ArgumentError, TypeError
    nil
  end
end
