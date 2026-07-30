require "uri"

class ArticleContentImageUrlOptimizer
  MICROCMS_IMAGE_HOST = "images.microcms-assets.io".freeze
  OPTIMIZED_IMAGE_PARAMS = {
    "fit" => "max",
    "w" => "800",
    "h" => "800"
  }.freeze
  RESPONSIVE_IMAGE_WIDTHS = [ 400, 800 ].freeze
  RESPONSIVE_IMAGE_SIZES = "(max-width: 800px) 100vw, 800px".freeze

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
      attributes = optimized_attributes(image["src"])
      next unless attributes

      attributes.each do |attribute, value|
        image[attribute] = value
      end
    end

    fragment.to_html
  end

  private

  attr_reader :content

  def microcms_image_url?(uri)
    uri.is_a?(URI::HTTPS) && uri.host == MICROCMS_IMAGE_HOST
  end

  def optimized_attributes(url)
    uri = URI.parse(url)
    return unless microcms_image_url?(uri)

    {
      "src" => optimized_url(uri),
      "srcset" => responsive_srcset(uri),
      "sizes" => RESPONSIVE_IMAGE_SIZES,
      "decoding" => "async"
    }
  rescue URI::InvalidURIError
    nil
  end

  def responsive_srcset(uri)
    RESPONSIVE_IMAGE_WIDTHS.map do |width|
      "#{optimized_url(uri, width:)} #{width}w"
    end.join(", ")
  end

  def optimized_url(uri, width: OPTIMIZED_IMAGE_PARAMS.fetch("w").to_i)
    optimized_uri = uri.dup
    optimized_uri.query = optimized_query(optimized_uri.query, width:)
    optimized_uri.to_s
  end

  def optimized_query(query, width: OPTIMIZED_IMAGE_PARAMS.fetch("w").to_i)
    params = URI.decode_www_form(query.to_s).reject do |key, _value|
      OPTIMIZED_IMAGE_PARAMS.key?(key)
    end

    optimized_params = OPTIMIZED_IMAGE_PARAMS.merge("w" => width.to_s, "h" => width.to_s)
    URI.encode_www_form(params + optimized_params.to_a)
  end
end
