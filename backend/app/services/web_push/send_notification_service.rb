require "json"
require "web_push"

module WebPush
  class SendNotificationService
    def self.call(subscription:, title:, body:, url:)
      new.call(subscription:, title:, body:, url:)
    end

    def call(subscription:, title:, body:, url:)
      ::WebPush.payload_send(
        message: JSON.generate(title:, body:, url:),
        endpoint: subscription.fetch(:endpoint),
        p256dh: subscription.fetch(:p256dh),
        auth: subscription.fetch(:auth),
        vapid: vapid,
        ttl: 86_400,
        urgency: "normal"
      )
    end

    private

    def vapid
      {
        subject: credential!(:vapid_subject),
        public_key: credential!(:vapid_public_key),
        private_key: credential!(:vapid_private_key)
      }
    end

    def credential!(key)
      value = Rails.application.credentials.dig(:web_push, key).to_s.strip
      raise "web_push.#{key} is missing" if value.empty?

      value
    end
  end
end
