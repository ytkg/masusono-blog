module Microcms
  module MasudaRun
    class FetchRankingsService < FetchContentsService
      ENDPOINT = "https://masusono.microcms.io/api/v1/masudarunkings".freeze

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
