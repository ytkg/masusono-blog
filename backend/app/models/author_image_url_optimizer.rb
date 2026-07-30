require "uri"

class AuthorImageUrlOptimizer
  MICROCMS_IMAGE_HOST = "images.microcms-assets.io".freeze
  AVATAR_PARAMS = {
    "fit" => "crop",
    "w" => "192",
    "h" => "192"
  }.freeze

  def self.call(url)
    new(url).call
  end

  def initialize(url)
    @url = url
  end

  def call
    return url unless url.is_a?(String)

    uri = URI.parse(url)
    return url unless microcms_image_url?(uri)

    uri.query = optimized_query(uri.query)
    uri.to_s
  rescue URI::InvalidURIError
    url
  end

  private

  attr_reader :url

  def microcms_image_url?(uri)
    uri.is_a?(URI::HTTPS) && uri.host == MICROCMS_IMAGE_HOST
  end

  def optimized_query(query)
    params = URI.decode_www_form(query.to_s).reject { |key, _value| AVATAR_PARAMS.key?(key) }

    URI.encode_www_form(params + AVATAR_PARAMS.to_a)
  end
end
