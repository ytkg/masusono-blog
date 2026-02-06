require "time"

class SitemapsController < ApplicationController
  include MicrocmsResponseHandling

  CONTENT_TYPE = "application/xml; charset=utf-8".freeze
  BLOG_ENTRY = { changefreq: "monthly", priority: 0.6 }.freeze

  STATIC_ENTRIES = [
    { path: "/", changefreq: "weekly", priority: 1.0 },
    { path: "/blog", changefreq: "weekly", priority: 0.8 },
    { path: "/about", changefreq: "monthly", priority: 0.7 },
    { path: "/podcast", changefreq: "weekly", priority: 0.8 },
    { path: "/shops", changefreq: "weekly", priority: 0.8 },
  ].freeze

  def show
    response = microcms_client.response
    return render_microcms_error(response) unless response.success?

    xml = build_sitemap_xml(microcms_client.articles)
    render plain: xml, content_type: CONTENT_TYPE
  rescue StandardError => e
    log_microcms_error("sitemap generation failed", e)
    head :bad_gateway
  end

  private

  def build_sitemap_xml(articles)
    base_url = "https://masusono.com"
    entries = static_entries(base_url) + article_entries(articles, base_url)
    serialize_entries(entries)
  end

  def static_entries(base_url)
    STATIC_ENTRIES.map do |entry|
      {
        loc: "#{base_url}#{entry[:path]}",
        changefreq: entry[:changefreq],
        priority: entry[:priority],
      }
    end
  end

  def article_entries(articles, base_url)
    articles.filter_map do |article|
      id = article["id"]
      next if id.nil? || id == ""

      {
        loc: "#{base_url}/blog/#{id}",
        lastmod: article["publishedAt"],
        changefreq: BLOG_ENTRY[:changefreq],
        priority: BLOG_ENTRY[:priority],
      }
    end
  end

  def serialize_entries(entries)
    lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    entries.each do |entry|
      lines << "  <url>"
      lines << "    <loc>#{escape_xml(entry[:loc])}</loc>"
      lastmod = normalize_date(entry[:lastmod])
      lines << "    <lastmod>#{escape_xml(lastmod)}</lastmod>" if lastmod
      lines << "    <changefreq>#{escape_xml(entry[:changefreq])}</changefreq>" if entry[:changefreq]
      if entry[:priority] != nil
        lines << "    <priority>#{format('%.1f', entry[:priority])}</priority>"
      end
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

    time = Time.parse(value) rescue nil
    time&.utc&.iso8601
  end
end
