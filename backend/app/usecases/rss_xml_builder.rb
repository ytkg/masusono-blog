class RssXmlBuilder
  include XmlEscaper
  include XmlDateFormatter

  def self.call(title:, link:, description:, feed_url:, items:)
    new(title:, link:, description:, feed_url:, items:).call
  end

  def initialize(title:, link:, description:, feed_url:, items:)
    @title = title
    @link = link
    @description = description
    @feed_url = feed_url
    @items = items
  end

  def call
    lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
      "  <channel>",
      "    <title>#{escape_xml(title)}</title>",
      "    <link>#{escape_xml(link)}</link>",
      "    <description>#{escape_xml(description)}</description>",
      "    <atom:link href=\"#{escape_xml(feed_url)}\" rel=\"self\" type=\"application/rss+xml\" />"
    ]

    items.each do |item|
      lines.concat(item_lines(item))
    end

    lines << "  </channel>"
    lines << "</rss>"
    "#{lines.join("\n")}\n"
  end

  private

  attr_reader :title, :link, :description, :feed_url, :items

  def item_lines(item)
    lines = [
      "    <item>",
      "      <title>#{escape_xml(item[:title])}</title>",
      "      <link>#{escape_xml(item[:link])}</link>",
      "      <guid isPermaLink=\"true\">#{escape_xml(item[:guid])}</guid>"
    ]
    pub_date = format_xml_date(item[:published_at], &:rfc2822)
    lines << "      <pubDate>#{escape_xml(pub_date)}</pubDate>" if pub_date
    lines << "      <description>#{escape_xml(item[:description])}</description>" if item[:description]
    lines << "      <dc:creator>#{escape_xml(item[:author])}</dc:creator>" unless item[:author].to_s.empty?
    lines << "    </item>"
    lines
  end
end
