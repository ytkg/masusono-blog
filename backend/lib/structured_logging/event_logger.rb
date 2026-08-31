require "json"

module StructuredLogging
  class EventLogger
    class << self
      def request_completed(payload:, duration_ms:)
        status = payload[:status].to_i

        log(
          level_for_status(status),
          event: "request_completed",
          method: payload[:method],
          path: path_without_query(payload[:path] || CurrentRequest.path),
          status:,
          duration_ms: duration_ms.round(1),
          request_id: payload[:request_id] || CurrentRequest.request_id
        )
      end

      def microcms_failure(error_type:, upstream_status: nil)
        log(
          :error,
          event: "microcms_request_failed",
          service: "microcms",
          error_type:,
          upstream_status:,
          **request_context
        )
      end

      def microcms_warning(error_type:)
        log(
          :warn,
          event: "microcms_request_warning",
          service: "microcms",
          error_type:,
          **request_context
        )
      end

      private

      def log(level, **payload)
        payload = payload.compact
        Rails.logger.public_send(level, formatted_message(payload))
      end

      def formatted_message(payload)
        return JSON.generate(payload) if Rails.env.production?

        "[#{payload.fetch(:event)}] #{payload.except(:event).map { |key, value| "#{key}=#{value}" }.join(" ")}".strip
      end

      def level_for_status(status)
        return :error if status >= 500
        return :warn if status >= 400

        :info
      end

      def path_without_query(path)
        path.to_s.split("?", 2).first
      end

      def request_context
        {
          request_id: CurrentRequest.request_id,
          path: CurrentRequest.path
        }
      end
    end
  end
end
