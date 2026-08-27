namespace :web_push do
  desc "Generate a VAPID key pair for Rails credentials"
  task generate_vapid_keys: :environment do
    key = WebPush.generate_key
    puts "web_push:"
    puts "  vapid_public_key: #{key.public_key}"
    puts "  vapid_private_key: #{key.private_key}"
    puts "  vapid_subject: mailto:YOUR_EMAIL@example.com"
  end

  desc "Send a notification to every current Web Push subscription"
  task send: :environment do
    title = ENV.fetch("TITLE", "").strip
    body = ENV.fetch("BODY", "").strip
    url = ENV.fetch("URL", "/").strip
    abort "TITLE is required" if title.empty?
    abort "BODY is required" if body.empty?
    abort "URL must start with /" unless url.start_with?("/")

    sent_count = 0
    removed_count = 0
    Microcms::WebPushSubscriptionsService.execute.each do |subscription|
      begin
        WebPush::SendNotificationService.call(subscription:, title:, body:, url:)
        sent_count += 1
      rescue WebPush::ExpiredSubscription, WebPush::InvalidSubscription
        Microcms::WebPushSubscriptionsService.delete(id: subscription.fetch(:id))
        removed_count += 1
      end
    end

    puts "Sent #{sent_count} notification(s); removed #{removed_count} expired subscription(s)."
  end
end
