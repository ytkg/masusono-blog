require "uri"

class NavigationFailurePayloadBuilder
  KINDS = %w[http_exception network_error].freeze
  BOOLEAN_KEYS = %w[prefetch prefetch_in_flight online service_worker].freeze

  def self.call(params)
    kind = params["kind"]
    raise ArgumentError unless KINDS.include?(kind)

    payload = {
      kind:,
      path: public_path(params["path"]),
      source_path: public_path(params["source_path"]),
      status: integer_in_range(params["status"], 100..599),
      response_request_id: token(params["response_request_id"], 100),
      content_type: token(params["content_type"], 100, /\A[a-zA-Z0-9.+\/-]+\z/),
      elapsed_ms: integer_in_range(params["elapsed_ms"], 0..86_400_000)
    }
    BOOLEAN_KEYS.each do |key|
      payload[key.to_sym] = params[key] if [ true, false ].include?(params[key])
    end
    payload.compact
  end

  def self.public_path(value)
    return unless value.is_a?(String) && value.bytesize <= 512

    uri = URI.parse(value)
    return if uri.host || uri.scheme

    path = uri.path
    return unless path.match?(%r{\A/(?:|about|others|search|authors(?:/[a-zA-Z0-9_-]+)?|numbers|articles/[a-zA-Z0-9_-]+|blog(?:/[a-zA-Z0-9_-]+)?)\z})

    path
  rescue URI::InvalidURIError
    nil
  end

  def self.integer_in_range(value, range)
    value if value.is_a?(Integer) && range.cover?(value)
  end

  def self.token(value, limit, pattern = /\A[a-zA-Z0-9_-]+\z/)
    value if value.is_a?(String) && value.bytesize <= limit && value.match?(pattern)
  end

  private_class_method :public_path, :integer_in_range, :token
end
