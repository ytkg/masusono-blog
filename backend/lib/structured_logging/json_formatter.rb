require "json"
require "time"

module StructuredLogging
  class JsonFormatter
    def call(severity, time, _progname, message)
      JSON.generate(
        timestamp: time.utc.iso8601(3),
        severity: severity.downcase,
        **message_payload(message)
      ) << "\n"
    end

    private

    def message_payload(message)
      parsed = JSON.parse(message)
      return parsed if parsed.is_a?(Hash)

      { message: message.to_s }
    rescue JSON::ParserError, TypeError
      { message: message.to_s }
    end
  end
end
