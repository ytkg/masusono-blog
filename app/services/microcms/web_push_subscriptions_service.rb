require "faraday"
require "json"

module Microcms
  class WebPushSubscriptionsService < FetchContentsService
    ENDPOINT = "https://masusono.microcms.io/api/v1/web_push_subscriptions".freeze

    def self.upsert(endpoint:, p256dh:, auth:, api_key: nil, faraday: nil)
      existing = execute(api_key:, faraday:, filters: "endpoint[equals]#{endpoint}").first
      attributes = { endpoint:, p256dh:, auth: }

      return create(attributes:, api_key:, faraday:) unless existing

      update(id: existing[:id], attributes:, api_key:, faraday:)
    end

    def self.delete_by_endpoint(endpoint:, api_key: nil, faraday: nil)
      subscriptions = execute(api_key:, faraday:, filters: "endpoint[equals]#{endpoint}")
      ids = subscriptions.map { |subscription| subscription_id!(subscription[:id]) }
      ids.each { |id| delete(id:, api_key:, faraday:) }
      subscriptions
    end

    def self.create(attributes:, api_key: nil, faraday: nil)
      response = client(api_key:, faraday:).post(ENDPOINT) do |request|
        write_request(request, attributes, api_key:)
      end
      raise_on_error!(response)

      json = JSON.parse(response.body) if response.body.is_a?(String)
      { id: subscription_id!(json.is_a?(Hash) ? json["id"] : nil) }
    rescue JSON::ParserError
      raise FetchError.new(status: 502, body: "Invalid microCMS response"), cause: nil
    end

    def self.update(id:, attributes:, api_key: nil, faraday: nil)
      subscription_id!(id)
      response = client(api_key:, faraday:).patch("#{ENDPOINT}/#{id}") do |request|
        write_request(request, attributes, api_key:)
      end
      raise_on_error!(response)

      { id: id }
    end

    def self.delete(id:, api_key: nil, faraday: nil)
      subscription_id!(id)
      response = client(api_key:, faraday:).delete("#{ENDPOINT}/#{id}") do |request|
        request.headers["X-MICROCMS-API-KEY"] = resolved_api_key(api_key)
      end
      raise_on_error!(response)
    end

    def self.subscription_id!(id)
      return id if id.is_a?(String) && !id.strip.empty?

      raise FetchError.new(status: 502, body: "Invalid microCMS response")
    end
    private_class_method :subscription_id!

    def self.client(api_key:, faraday:)
      return faraday if faraday

      Microcms::ConnectionFactory.build
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
