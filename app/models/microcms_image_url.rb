require "uri"

class MicrocmsImageUrl
  HOST = "images.microcms-assets.io".freeze
  RESIZE_KEYS = %w[fit w h].freeze

  def self.parse(url)
    return unless url.is_a?(String)

    uri = URI.parse(url)
    new(uri) if uri.is_a?(URI::HTTPS) && uri.host == HOST
  rescue URI::InvalidURIError
    nil
  end

  def initialize(uri)
    @uri = uri
  end

  def resize(fit:, size:)
    resized = @uri.dup
    params = URI.decode_www_form(resized.query.to_s).reject { |key, _value| RESIZE_KEYS.include?(key) }
    resize_params = { "fit" => fit, "w" => size.to_s, "h" => size.to_s }
    resized.query = URI.encode_www_form(params + resize_params.to_a)
    resized.to_s
  end
end
