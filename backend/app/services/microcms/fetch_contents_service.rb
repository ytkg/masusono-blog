require "faraday"
require "json"

module Microcms
  class FetchContentsService
    DEFAULT_MAX_PAGES = 100
    DEFAULT_MAX_TOTAL_COUNT = 10_000

    class FetchError < StandardError
      attr_reader :status, :body

      def initialize(status:, body:)
        @status = status
        @body = body
        StructuredLogging::EventLogger.microcms_failure(
          error_type: "upstream_http_error",
          upstream_status: status
        )
        super("microCMS request failed: status=#{status}")
      end
    end

    def self.execute(api_key: nil, faraday: nil, filters: nil, ids: nil, response: nil)
      new(api_key: api_key, faraday: faraday, filters: filters, ids: ids).execute(response: response)
    end

    def self.page(limit:, offset:, api_key: nil, faraday: nil)
      new(api_key:, faraday:).page(limit:, offset:)
    end

    # Fetch exactly one upstream page; full-collection callers still use execute.
    def page(limit:, offset:)
      response = fetch_response(limit:, offset:)
      raise_on_error!(response)
      page = parse_page(response.body)
      meta = page.fetch(:meta)
      unless pageable?(meta) && valid_pagination_meta?(meta) && meta[:limit] == limit && meta[:offset] == offset
        raise FetchError.new(status: 502, body: "Invalid pagination metadata")
      end

      { contents: page.fetch(:contents).first(limit), total_count: meta[:total_count] }
    end

    def initialize(api_key: nil, faraday: nil, filters: nil, ids: nil)
      @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
      raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

      @faraday = faraday || Faraday.new do |f|
        f.options.timeout = 10
        f.options.open_timeout = 5
      end
      @filters = filters
      @ids = ids
    end

    def execute(response: nil)
      initial_response = response || self.response
      raise_on_error!(initial_response)

      first_page = parse_page(initial_response.body)
      contents = []
      first_page_append_result = append_contents(contents, first_page.fetch(:contents))
      if first_page_append_result == :max_total_count_reached
        log_pagination_warning("max_total_count_reached")
        return contents
      end

      meta = first_page.fetch(:meta)
      return contents unless pageable?(meta)
      unless valid_pagination_meta?(meta)
        log_pagination_warning("invalid_pagination_meta")
        return contents
      end

      total_count = meta[:total_count]
      limit = meta[:limit]
      offset = meta[:offset]
      page_count = 1
      while offset + limit < total_count
        if page_count >= max_pages
          log_pagination_warning("max_pages_reached")
          break
        end

        offset += limit
        res = fetch_response(limit: limit, offset: offset)
        raise_on_error!(res)
        page = parse_page(res.body)
        append_result = append_contents(contents, page.fetch(:contents))
        page_count += 1
        if append_result == :max_total_count_reached
          log_pagination_warning("max_total_count_reached")
          break
        end
      end

      contents
    end

    def response
      @response ||= fetch_response
    end

    def fetch_response(limit: 100, offset: 0)
      faraday.get(microcms_uri(limit: limit, offset: offset)) do |req|
        req.headers["X-API-KEY"] = api_key
        req.headers["Accept"] = "application/json"
      end
    end

    def parse_contents(body)
      contents_from(parse_payload(body))
    end

    def parse_meta(body)
      meta_from(parse_payload(body))
    rescue JSON::ParserError
      {}
    end

    private

    attr_reader :api_key, :faraday

    def raise_on_error!(response)
      return if response.success?

      raise FetchError.new(status: response.status, body: response.body)
    end

    def parse_page(body)
      json = parse_payload(body)
      { contents: contents_from(json), meta: meta_from(json) }
    end

    def parse_payload(body)
      JSON.parse(body, symbolize_names: true)
    end

    def contents_from(json)
      contents = json[:contents]
      contents.is_a?(Array) ? contents : []
    end

    def meta_from(json)
      {
        total_count: json[:totalCount],
        limit: json[:limit],
        offset: json[:offset]
      }
    end

    def pageable?(meta)
      meta[:total_count].is_a?(Integer) &&
        meta[:limit].is_a?(Integer) &&
        meta[:offset].is_a?(Integer)
    end

    def valid_pagination_meta?(meta)
      meta[:total_count] >= 0 &&
        meta[:limit] > 0 &&
        meta[:offset] >= 0
    end

    def append_contents(contents, new_contents)
      remaining = max_total_count - contents.size
      return :max_total_count_reached if remaining <= 0

      contents.concat(new_contents.first(remaining))
      return :max_total_count_reached if new_contents.size > remaining

      :ok
    end

    def max_pages
      @max_pages ||= parse_positive_integer_env("MICROCMS_MAX_PAGES", DEFAULT_MAX_PAGES)
    end

    def max_total_count
      @max_total_count ||= parse_positive_integer_env("MICROCMS_MAX_TOTAL_COUNT", DEFAULT_MAX_TOTAL_COUNT)
    end

    def parse_positive_integer_env(key, default)
      raw = ENV[key]
      return default if raw.nil? || raw.strip.empty?

      parsed = Integer(raw, exception: false)
      return default unless parsed&.positive?

      parsed
    end

    def log_pagination_warning(error_type)
      StructuredLogging::EventLogger.microcms_warning(error_type:)
    end

    def microcms_uri(limit:, offset:)
      uri = URI(self.class::ENDPOINT)
      uri.query = URI.encode_www_form(query_params(limit:, offset:))
      uri
    end

    def query_params(limit:, offset:)
      { limit:, offset:, orders: "-publishedAt" }.tap do |params|
        params[:filters] = filters if filters
        params[:ids] = ids if ids
      end
    end

    def filters
      @filters
    end

    def ids
      @ids
    end
  end
end
