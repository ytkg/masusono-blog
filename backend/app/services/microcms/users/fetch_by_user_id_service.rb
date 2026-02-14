require "faraday"
require "json"
require "uri"

module Microcms
  module Users
    class FetchByUserIdService
      ENDPOINT = "https://masusono.microcms.io/api/v1/users".freeze

      def self.execute(user_id:, api_key: nil, faraday: nil)
        new(api_key: api_key, faraday: faraday).execute(user_id:)
      end

      def initialize(api_key: nil, faraday: nil)
        @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
        raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

        @faraday = faraday || Faraday.new do |f|
          f.options.timeout = 10
          f.options.open_timeout = 5
        end
      end

      def execute(user_id:)
        response = faraday.get(microcms_uri(user_id: user_id)) do |req|
          req.headers["X-API-KEY"] = api_key
          req.headers["Accept"] = "application/json"
        end

        raise_on_error!(response)
        parse_response(response.body)
      end

      private

      attr_reader :api_key, :faraday

      def raise_on_error!(response)
        return if response.success?

        raise Microcms::FetchContentsService::FetchError.new(status: response.status, body: response.body)
      end

      def microcms_uri(user_id:)
        uri = URI(self.class::ENDPOINT)
        uri.query = URI.encode_www_form(limit: 1, filters: "user_id[equals]#{user_id}")
        uri
      end

      def parse_response(body)
        parsed = JSON.parse(body)
        first = Array(parsed["contents"]).first
        return {} unless first.is_a?(Hash)

        {
          id: first["id"],
          user_id: first["user_id"],
          name: first["name"]
        }
      rescue JSON::ParserError
        {}
      end
    end
  end
end
