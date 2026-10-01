module Api
  module App
    module WebPush
      class SubscriptionsShowUsecase
        def self.call(endpoint:)
          new.call(endpoint:)
        end

        def call(endpoint:)
          normalized_endpoint = endpoint.to_s.strip
          raise ArgumentError, "subscription endpoint is required" if normalized_endpoint.empty?

          subscriptions = ::Microcms::WebPushSubscriptionsService.execute(filters: "endpoint[equals]#{normalized_endpoint}")
          subscribed = subscriptions.any? { |subscription| subscription[:endpoint] == normalized_endpoint }
          { json: { subscribed: }, status: :ok }
        end
      end
    end
  end
end
