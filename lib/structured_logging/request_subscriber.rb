module StructuredLogging
  class RequestSubscriber
    def self.install!
      return if @installed

      ActiveSupport::Notifications.subscribe("process_action.action_controller") do |*args|
        event = ActiveSupport::Notifications::Event.new(*args)
        EventLogger.request_completed(payload: event.payload, duration_ms: event.duration)
      end

      @installed = true
    end
  end
end
