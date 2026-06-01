require "uri"

class ArticleContentImageUrlOptimizer
  MICROCMS_IMAGE_HOST = "images.microcms-assets.io".freeze
  OPTIMIZED_IMAGE_PARAMS = {
    "fit" => "max",
    "w" => "800",
    "h" => "800"
  }.freeze

  def self.call(content)
    new(content).call
  end

  def initialize(content)
    @content = content
  end

  def call
    return content unless content.is_a?(String)
    return content if content.blank?

    fragment = Nokogiri::HTML5.fragment(content)

    fragment.css("img[src]").each do |image|
      image["src"] = optimized_url(image["src"])
    end

    fragment.to_html
  end

  private

  attr_reader :content

  def optimized_url(url)
    uri = URI.parse(url)
    return url unless microcms_image_url?(uri)

    uri.query = optimized_query(uri.query)
    uri.to_s
  rescue URI::InvalidURIError
    url
  end

  def microcms_image_url?(uri)
    uri.is_a?(URI::HTTPS) && uri.host == MICROCMS_IMAGE_HOST
  end

  def optimized_query(query)
    params = URI.decode_www_form(query.to_s).reject do |key, _value|
      OPTIMIZED_IMAGE_PARAMS.key?(key)
    end

    URI.encode_www_form(params + OPTIMIZED_IMAGE_PARAMS.to_a)
  end
end
