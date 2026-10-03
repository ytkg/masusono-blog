require "time"

class SitemapXmlBuilder
  include XmlEscaper

  def self.call(entries)
    new(entries).call
  end

  def initialize(entries)
    @entries = entries
  end

  def call
    lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    entries.each do |entry|
      lines.concat(entry_lines(entry))
    end

    lines << "</urlset>"
    "#{lines.join("\n")}\n"
  end

  private

  attr_reader :entries

  def entry_lines(entry)
    lines = [ "  <url>" ]
    lines << "    <loc>#{escape_xml(entry[:loc])}</loc>"
    lastmod = normalize_date(entry[:lastmod])
    lines << "    <lastmod>#{escape_xml(lastmod)}</lastmod>" if lastmod
    lines << "    <changefreq>#{escape_xml(entry[:changefreq])}</changefreq>" if entry[:changefreq]
    lines << "    <priority>#{format('%.1f', entry[:priority])}</priority>" if entry[:priority] != nil
    lines << "  </url>"
    lines
  end

  def normalize_date(value)
    return nil if value.nil? || value == ""

    Time.parse(value).utc.iso8601
  rescue ArgumentError, TypeError
    nil
  end
end
