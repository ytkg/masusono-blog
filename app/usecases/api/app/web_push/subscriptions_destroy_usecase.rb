module Api
  module App
    module WebPush
      class SubscriptionsDestroyUsecase
        def self.call(endpoint:)
          new.call(endpoint:)
        end

        def call(endpoint:)
          normalized_endpoint = endpoint.to_s.strip
          raise ArgumentError, "subscription endpoint is required" if normalized_endpoint.empty?

          ::Microcms::WebPushSubscriptionsService.delete_by_endpoint(endpoint: normalized_endpoint)
          { json: {}, status: :no_content }
        end
      end
    end
  end
end
