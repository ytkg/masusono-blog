require "faraday"
require "json"

module Microcms
  module Articles
    class UpdateTagsService
      ENDPOINT = "https://masusono.microcms.io/api/v1/articles".freeze

      def self.execute(article_id:, tags:, api_key: nil, faraday: nil)
        new(api_key:, faraday:).execute(article_id:, tags:)
      end

      def initialize(api_key: nil, faraday: nil)
        @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
        raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

        @faraday = faraday || Microcms::ConnectionFactory.build
      end

      def execute(article_id:, tags:)
        response = faraday.patch("#{self.class::ENDPOINT}/#{article_id}") do |req|
          req.headers["X-MICROCMS-API-KEY"] = api_key
          req.headers["Content-Type"] = "application/json"
          req.headers["Accept"] = "application/json"
          req.body = JSON.generate(tags:)
        end

        raise_on_error!(response)
        { id: article_id, tags: }
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
