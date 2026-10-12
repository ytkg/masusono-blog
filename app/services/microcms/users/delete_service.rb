require "faraday"

module Microcms
  module Users
    class DeleteService
      ENDPOINT = "https://masusono.microcms.io/api/v1/users".freeze

      def self.execute(content_id:, api_key: nil, faraday: nil)
        new(api_key:, faraday:).execute(content_id:)
      end

      def initialize(api_key: nil, faraday: nil)
        @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
        raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

        @faraday = faraday || Microcms::ConnectionFactory.build
      end

      def execute(content_id:)
        response = faraday.delete("#{self.class::ENDPOINT}/#{content_id}") do |request|
          request.headers["X-MICROCMS-API-KEY"] = api_key
          request.headers["Accept"] = "application/json"
        end

        raise_on_error!(response)
        { id: content_id }
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
