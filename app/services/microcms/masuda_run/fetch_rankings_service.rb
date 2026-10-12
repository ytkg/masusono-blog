module Microcms
  module MasudaRun
    class FetchRankingsService < FetchContentsService
      ENDPOINT = "https://masusono.microcms.io/api/v1/masudarunkings".freeze

      def self.execute(api_key: nil, faraday: nil, response: nil, limit: nil)
        new(api_key: api_key, faraday: faraday).execute(response: response, limit: limit)
      end

      def self.fetch_total_count(api_key: nil, faraday: nil, response: nil)
        new(api_key: api_key, faraday: faraday).fetch_total_count(response: response)
      end

      def execute(response: nil, limit: nil)
        normalized_limit = Integer(limit, exception: false)
        return super(response: response) unless normalized_limit&.positive?

        limited_response = response || fetch_response(limit: normalized_limit, offset: 0)
        raise_on_error!(limited_response)

        parse_contents(limited_response.body)
      end

      def fetch_total_count(response: nil)
        count_response = response || fetch_response(limit: 1, offset: 0)
        raise_on_error!(count_response)

        total_count = parse_meta(count_response.body)[:total_count]
        return total_count if total_count.is_a?(Integer) && total_count >= 0

        nil
      end

      def fetch_response(limit: 10, offset: 0)
        faraday.get(microcms_uri(limit: limit, offset: offset)) do |req|
          req.headers["X-API-KEY"] = api_key
          req.headers["Accept"] = "application/json"
        end
      end

      def microcms_uri(limit:, offset:)
        uri = URI(self.class::ENDPOINT)
        uri.query = URI.encode_www_form(
          limit: limit,
          offset: offset,
          orders: "-score,-createdAt"
        )
        uri
      end
    end
  end
end
