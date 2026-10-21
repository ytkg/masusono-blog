require "uri"

class NavigationFailurePayloadBuilder
  KINDS = %w[http_exception network_error navigation_stalled navigation_slow navigation_interrupted module_load_error].freeze
  BOOLEAN_KEYS = %w[prefetch prefetch_in_flight online service_worker standalone backgrounded recovered].freeze
  TIMING_KEYS = %w[release_ms tap_ms request_ms response_ms data_ready_ms module_start_ms module_end_ms commit_ms frame_ms since_resume_ms].freeze
  STAGES = %w[release tap request response data_ready module_start module_end commit frame].freeze
  CONTROLLER_STATES = %w[none installing installed activating activated redundant].freeze
  BOOLEAN_VALUES = [ true, false ].freeze

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
      payload[key.to_sym] = params[key] if BOOLEAN_VALUES.include?(params[key])
    end
    TIMING_KEYS.each do |key|
      payload[key.to_sym] = integer_in_range(params[key], 0..86_400_000)
    end
    payload[:build_version] = token(params["build_version"], 12, /\A[0-9]{12}\z/)
    payload[:stage] = params["stage"] if STAGES.include?(params["stage"])
    payload[:controller_state] = params["controller_state"] if CONTROLLER_STATES.include?(params["controller_state"])
    payload[:data_source] = params["data_source"] if %w[cached in_flight network].include?(params["data_source"])
    payload[:visibility] = params["visibility"] if %w[visible hidden].include?(params["visibility"])
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
