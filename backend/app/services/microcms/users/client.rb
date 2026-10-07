require "faraday"
require "json"
require "uri"

module Microcms
  module Users
    class Client
      def initialize(endpoint:, api_key: nil, faraday: nil)
        @endpoint = endpoint
        @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
        raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

        @faraday = faraday || Microcms::ConnectionFactory.build
      end

      def fetch_contents(filters:, limit:)
        response = faraday.get(uri(filters:, limit:)) do |request|
          request.headers["X-API-KEY"] = api_key
          request.headers["Accept"] = "application/json"
        end

        raise_on_error!(response)
        contents = JSON.parse(response.body).fetch("contents", [])
        contents.is_a?(Array) ? contents : []
      rescue JSON::ParserError
        []
      end

      def fetch_content(content_id:)
        response = faraday.get("#{endpoint}/#{content_id}") do |request|
          request.headers["X-API-KEY"] = api_key
          request.headers["Accept"] = "application/json"
        end

        return {} if response.status == 404

        raise_on_error!(response)
        JSON.parse(response.body)
      rescue JSON::ParserError
        {}
      end

      private

      attr_reader :api_key, :endpoint, :faraday

      def raise_on_error!(response)
        return if response.success?

        raise Microcms::FetchContentsService::FetchError.new(status: response.status, body: response.body)
      end

      def uri(filters:, limit:)
        endpoint_uri = URI(endpoint)
        endpoint_uri.query = URI.encode_www_form(limit:, filters:)
        endpoint_uri
      end
    end
  end
end
