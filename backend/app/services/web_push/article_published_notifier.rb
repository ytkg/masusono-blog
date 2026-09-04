module WebPush
  class ArticlePublishedNotifier
    Result = Data.define(:sent_count, :removed_count, :failed_count)

    def self.call(article:, subscriptions_service: Microcms::WebPushSubscriptionsService, notification_service: SendNotificationService, logger: Rails.logger)
      new(article:, subscriptions_service:, notification_service:, logger:).call
    end

    def initialize(article:, subscriptions_service:, notification_service:, logger:)
      @article = article
      @subscriptions_service = subscriptions_service
      @notification_service = notification_service
      @logger = logger
    end

    def call
      counts = { sent: 0, removed: 0, failed: 0 }
      subscriptions_service.execute.each { |subscription| deliver(subscription, counts) }
      Result.new(sent_count: counts[:sent], removed_count: counts[:removed], failed_count: counts[:failed])
    end

    private

    attr_reader :article, :logger, :notification_service, :subscriptions_service

    def deliver(subscription, counts)
      notification_service.call(subscription:, title: article.fetch(:title), body: "新しい記事を公開しました", url: "/articles/#{article.fetch(:id)}")
      counts[:sent] += 1
    rescue ::WebPush::ExpiredSubscription, ::WebPush::InvalidSubscription
      remove_expired_subscription(subscription, counts)
    rescue StandardError => error
      counts[:failed] += 1
      log_failure(subscription, error)
    end

    def remove_expired_subscription(subscription, counts)
      subscriptions_service.delete(id: subscription.fetch(:id))
      counts[:removed] += 1
    rescue StandardError => error
      counts[:failed] += 1
      log_failure(subscription, error)
    end

    def log_failure(subscription, error)
      logger.warn("[WebPush::ArticlePublishedNotifier] delivery failed subscription_id=#{subscription[:id]} error=#{error.class}")
    end
  end
end
