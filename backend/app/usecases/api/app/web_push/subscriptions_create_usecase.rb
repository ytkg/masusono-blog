require "uri"

module Api
  module App
    module WebPush
      class SubscriptionsCreateUsecase
        MAX_ENDPOINT_LENGTH = SubscriptionInput::MAX_ENDPOINT_LENGTH
        MAX_KEY_LENGTH = SubscriptionInput::MAX_KEY_LENGTH
        SUPPORTED_ENDPOINT_HOSTS = SubscriptionInput::SUPPORTED_ENDPOINT_HOSTS

        def self.call(subscription:)
          new.call(subscription:)
        end

        def call(subscription:)
          endpoint, p256dh, auth = SubscriptionInput.call(subscription:)
          created = ::Microcms::WebPushSubscriptionsService.upsert(endpoint:, p256dh:, auth:)

          { json: { id: created.fetch(:id) }, status: :created }
        end
      end
    end
  end
end
