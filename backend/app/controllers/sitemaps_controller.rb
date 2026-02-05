require "time"

class SitemapsController < ApplicationController
  STATIC_ENTRIES = [
    { path: "/", changefreq: "weekly", priority: 1.0 },
    { path: "/blog", changefreq: "weekly", priority: 0.8 },
    { path: "/about", changefreq: "monthly", priority: 0.7 },
    { path: "/podcast", changefreq: "weekly", priority: 0.8 },
    { path: "/shops", changefreq: "weekly", priority: 0.8 },
  ].freeze

  def show
    client = Microcms::ArticlesClient.new
    response = client.response

    unless response.success?
      content_type = response.headers["content-type"] || "application/json"
      return render body: response.body, status: response.status, content_type: content_type
    end

    xml = build_sitemap_xml(client.articles)
    render plain: xml, content_type: "application/xml; charset=utf-8"
  rescue StandardError => e
    Rails.logger.error("sitemap generation failed: #{e.class}: #{e.message}")
    head :bad_gateway
  end

  private

  def build_sitemap_xml(articles)
    base_url = request.base_url.sub(%r{/\z}, "")
    entries = STATIC_ENTRIES.map do |entry|
      {
        loc: "#{base_url}#{entry[:path]}",
        changefreq: entry[:changefreq],
        priority: entry[:priority],
      }
    end

    articles.each do |article|
      id = article["id"]
      next if id.nil? || id == ""

      entries << {
        loc: "#{base_url}/blog/#{id}",
        lastmod: article["publishedAt"],
        changefreq: "monthly",
        priority: 0.6,
      }
    end

    serialize_entries(entries)
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
