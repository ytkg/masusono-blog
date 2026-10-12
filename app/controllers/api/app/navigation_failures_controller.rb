module Api
  module App
    class NavigationFailuresController < ApiController
      rate_limit to: 20, within: 1.minute, store: ActiveSupport::Cache::MemoryStore.new,
                 with: -> { render_error_response(status: :too_many_requests, code: "rate_limited", message: "Too many navigation failure reports.") }

      def create
        return head :content_too_large if request.content_length > 2048

        payload = NavigationFailurePayloadBuilder.call(params.expect(failure: [
          :kind, :path, :source_path, :status, :response_request_id, :content_type,
          :prefetch, :prefetch_in_flight, :elapsed_ms, :online, :service_worker
        ]).to_h)
        StructuredLogging::EventLogger.navigation_failure(payload:)
        head :no_content
      rescue ActionController::ParameterMissing, ArgumentError
        render_error_response(status: :bad_request, code: "invalid_request", message: "Invalid navigation failure report.")
      end
    end
  end
end
