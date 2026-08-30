require "faraday"
require "json"

module Microcms
  class WebPushSubscriptionsService < FetchContentsService
    ENDPOINT = "https://masusono.microcms.io/api/v1/web_push_subscriptions".freeze

    def self.upsert(endpoint:, p256dh:, auth:, api_key: nil, faraday: nil)
      existing = execute(api_key:, faraday:, filters: "endpoint[equals]#{endpoint}").first
      attributes = { endpoint:, p256dh:, auth: }

      return create(attributes:, api_key:, faraday:) unless existing

      update(id: existing.fetch(:id), attributes:, api_key:, faraday:)
    end

    def self.delete_by_endpoint(endpoint:, api_key: nil, faraday: nil)
      execute(api_key:, faraday:, filters: "endpoint[equals]#{endpoint}").each do |subscription|
        delete(id: subscription.fetch(:id), api_key:, faraday:)
      end
    end

    def self.create(attributes:, api_key: nil, faraday: nil)
      response = client(api_key:, faraday:).post(ENDPOINT) do |request|
        write_request(request, attributes, api_key:)
      end
      raise_on_error!(response)

      { id: JSON.parse(response.body).fetch("id") }
    end

    def self.update(id:, attributes:, api_key: nil, faraday: nil)
      response = client(api_key:, faraday:).patch("#{ENDPOINT}/#{id}") do |request|
        write_request(request, attributes, api_key:)
      end
      raise_on_error!(response)

      { id: id }
    end

    def self.delete(id:, api_key: nil, faraday: nil)
      response = client(api_key:, faraday:).delete("#{ENDPOINT}/#{id}") do |request|
        request.headers["X-MICROCMS-API-KEY"] = resolved_api_key(api_key)
      end
      raise_on_error!(response)
    end

    def self.client(api_key:, faraday:)
      return faraday if faraday

      Faraday.new do |connection|
        connection.options.timeout = 10
        connection.options.open_timeout = 5
      end
    end
    private_class_method :client

    def self.write_request(request, attributes, api_key:)
      request.headers["X-MICROCMS-API-KEY"] = resolved_api_key(api_key)
      request.headers["Content-Type"] = "application/json"
      request.headers["Accept"] = "application/json"
      request.body = JSON.generate(attributes)
    end
    private_class_method :write_request

    def self.resolved_api_key(api_key)
      key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
      raise "MICROCMS api key is missing (credentials: microcms.api_key)" if key.nil? || key.empty?

      key
    end
    private_class_method :resolved_api_key

    def self.raise_on_error!(response)
      return if response.success?

      raise FetchError.new(status: response.status, body: response.body)
    end
    private_class_method :raise_on_error!
  end
end
