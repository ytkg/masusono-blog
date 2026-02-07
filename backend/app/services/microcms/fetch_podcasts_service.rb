require "faraday"
require "json"

module Microcms
  class FetchPodcastsService
    MICROCMS_PODCASTS_ENDPOINT = "https://masusono.microcms.io/api/v1/podcasts".freeze

    class FetchError < StandardError
      attr_reader :status, :body

      def initialize(status:, body:)
        @status = status
        @body = body
        super("microCMS request failed: status=#{status}, body=#{body}")
      end
    end

    def self.execute(api_key: nil, faraday: nil, response: nil)
      new(api_key: api_key, faraday: faraday).execute(response: response)
    end

    def initialize(api_key: nil, faraday: nil)
      @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
      raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

      @faraday = faraday || Faraday.new do |f|
        f.options.timeout = 10
        f.options.open_timeout = 5
      end
    end

    def execute(response: nil)
      initial_response = response || self.response
      raise_on_error!(initial_response)

      podcasts = parse_podcasts(initial_response.body)
      meta = parse_meta(initial_response.body)
      return podcasts unless pageable?(meta)

      total_count = meta[:total_count]
      limit = meta[:limit]
      offset = meta[:offset]
      while offset + limit < total_count
        offset += limit
        res = fetch_response(limit: limit, offset: offset)
        raise_on_error!(res)
        podcasts.concat(parse_podcasts(res.body))
      end

      podcasts
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

    def parse_podcasts(body)
      json = JSON.parse(body)
      contents = json["contents"]
      return [] unless contents.is_a?(Array)

      contents
    end

    def parse_meta(body)
      json = JSON.parse(body)
      {
        total_count: json["totalCount"],
        limit: json["limit"],
        offset: json["offset"]
      }
    rescue JSON::ParserError
      {}
    end

    private

    attr_reader :api_key, :faraday

    def raise_on_error!(response)
      return if response.success?

      raise FetchError.new(status: response.status, body: response.body)
    end

    def pageable?(meta)
      meta[:total_count].is_a?(Integer) &&
        meta[:limit].is_a?(Integer) &&
        meta[:offset].is_a?(Integer)
    end

    def microcms_uri(limit:, offset:)
      uri = URI(MICROCMS_PODCASTS_ENDPOINT)
      uri.query = URI.encode_www_form(limit: limit, offset: offset, orders: "-publishedAt")
      uri
    end
  end
end
