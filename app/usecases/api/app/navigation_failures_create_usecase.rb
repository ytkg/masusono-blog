module Api
  module App
    class NavigationFailuresCreateUsecase
      def self.call(failure:)
        payload = NavigationFailurePayloadBuilder.call(failure)
        StructuredLogging::EventLogger.navigation_failure(payload:)
      end
    end
  end
end
