require "faraday"
require "json"

module Microcms
  module Users
    class UpsertByContentIdService
      ENDPOINT = "https://masusono.microcms.io/api/v1/users".freeze

      def self.execute(content_id:, user_id:, name:, api_key: nil, faraday: nil)
        new(api_key:, faraday:).execute(content_id:, user_id:, name:)
      end

      def initialize(api_key: nil, faraday: nil)
        @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
        raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

        @faraday = faraday || Faraday.new do |connection|
          connection.options.timeout = 10
          connection.options.open_timeout = 5
        end
      end

      def execute(content_id:, user_id:, name:)
        response = faraday.put("#{self.class::ENDPOINT}/#{content_id}") do |request|
          request.headers["X-MICROCMS-API-KEY"] = api_key
          request.headers["Content-Type"] = "application/json"
          request.headers["Accept"] = "application/json"
          request.body = JSON.generate(user_id:, name:)
        end

        raise_on_error!(response)
        { id: content_id, user_id:, name: }
      end

      private

      attr_reader :api_key, :faraday

      def raise_on_error!(response)
        return if response.success?

        raise Microcms::FetchContentsService::FetchError.new(status: response.status, body: response.body)
      end
    end
  end
end
