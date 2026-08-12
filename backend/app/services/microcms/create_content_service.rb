require "faraday"
require "json"

module Microcms
  class CreateContentService
    def self.execute(endpoint:, attributes:, api_key: nil, faraday: nil)
      new(endpoint:, attributes:, api_key:, faraday:).execute
    end

    def initialize(endpoint:, attributes:, api_key: nil, faraday: nil)
      @endpoint = endpoint
      @attributes = attributes
      @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
      raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

      @faraday = faraday || Faraday.new do |connection|
        connection.options.timeout = 10
        connection.options.open_timeout = 5
      end
    end

    def execute
      response = faraday.post(endpoint) do |request|
        request.headers["X-MICROCMS-API-KEY"] = api_key
        request.headers["Content-Type"] = "application/json"
        request.headers["Accept"] = "application/json"
        request.body = JSON.generate(attributes)
      end

      raise_on_error!(response)
      parse_response(response.body)
    end

    private

    attr_reader :api_key, :attributes, :endpoint, :faraday

    def raise_on_error!(response)
      return if response.success?

      raise FetchContentsService::FetchError.new(status: response.status, body: response.body)
    end

    def parse_response(body)
      { id: JSON.parse(body)["id"] }
    rescue JSON::ParserError
      { id: nil }
    end
  end
end
