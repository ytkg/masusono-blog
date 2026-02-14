require "faraday"
require "json"

module Microcms
  module MasudaRun
    class CreateRankingService
      ENDPOINT = "https://masusono.microcms.io/api/v1/masudarunkings".freeze

      def self.execute(user_id:, score:, api_key: nil, faraday: nil)
        new(api_key: api_key, faraday: faraday).execute(user_id:, score:)
      end

      def initialize(api_key: nil, faraday: nil)
        @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
        raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

        @faraday = faraday || Faraday.new do |f|
          f.options.timeout = 10
          f.options.open_timeout = 5
        end
      end

      def execute(user_id:, score:)
        response = faraday.post(self.class::ENDPOINT) do |req|
          req.headers["X-MICROCMS-API-KEY"] = api_key
          req.headers["Content-Type"] = "application/json"
          req.headers["Accept"] = "application/json"
          req.body = JSON.generate(user_id: user_id, score: score)
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

      def parse_response(body)
        parsed = JSON.parse(body)
        { id: parsed["id"] }
      rescue JSON::ParserError
        { id: nil }
      end
    end
  end
end
