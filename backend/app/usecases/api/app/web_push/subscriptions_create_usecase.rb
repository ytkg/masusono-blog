require "uri"

module Api
  module App
    module WebPush
      class SubscriptionsCreateUsecase
        MAX_ENDPOINT_LENGTH = 2_000
        MAX_KEY_LENGTH = 1_000
        SUPPORTED_ENDPOINT_HOSTS = %w[
          android.googleapis.com
          fcm.googleapis.com
          updates.push.services.mozilla.com
          web.push.apple.com
        ].freeze

        def self.call(subscription:)
          new.call(subscription:)
        end

        def call(subscription:)
          endpoint, p256dh, auth = normalize_subscription(subscription)
          created = ::Microcms::WebPushSubscriptionsService.upsert(endpoint:, p256dh:, auth:)

          { json: { id: created.fetch(:id) }, status: :created }
        end

        private

        def normalize_subscription(subscription)
          source = subscription.respond_to?(:to_unsafe_h) ? subscription.to_unsafe_h : subscription
          raise ArgumentError, "subscription is required" unless source.is_a?(Hash)

          keys = source["keys"] || source[:keys]
          endpoint = required_string(source["endpoint"] || source[:endpoint], "subscription endpoint", MAX_ENDPOINT_LENGTH)
          p256dh = required_string(keys&.[]("p256dh") || keys&.[](:p256dh), "subscription p256dh", MAX_KEY_LENGTH)
          auth = required_string(keys&.[]("auth") || keys&.[](:auth), "subscription auth", MAX_KEY_LENGTH)
          validate_endpoint!(endpoint)
          [ endpoint, p256dh, auth ]
        end

        def required_string(value, name, max_length)
          normalized = value.to_s.strip
          raise ArgumentError, "#{name} is required" if normalized.empty?
          raise ArgumentError, "#{name} is too long" if normalized.length > max_length

          normalized
        end

        def validate_endpoint!(endpoint)
          uri = URI.parse(endpoint)
          return if uri.is_a?(URI::HTTPS) && SUPPORTED_ENDPOINT_HOSTS.include?(uri.host)

          raise ArgumentError, "subscription endpoint is invalid"
        rescue URI::InvalidURIError
          raise ArgumentError, "subscription endpoint is invalid"
        end
      end
    end
  end
end
