require "rails_helper"

RSpec.describe WebPush::ArticlePublishedNotifier do
  let(:article) { { id: "article-1", title: "記事タイトル", author: { name: "その他1" } } }
  let(:subscription) { { id: "subscription-1" } }
  let(:subscriptions_service) { class_double(Microcms::WebPushSubscriptionsService, execute: [ subscription ], delete: nil) }
  let(:notification_service) { class_double(WebPush::SendNotificationService, call: nil) }

  let(:logger) { instance_double(ActiveSupport::Logger, warn: nil) }

  subject(:result) do
    described_class.call(
      article:,
      subscriptions_service:,
      notification_service:,
      logger:
    )
  end

  it "投稿者名と記事タイトルで通知する" do
    expect(result.sent_count).to eq(1)
    expect(notification_service).to have_received(:call).with(
      subscription:,
      title: "その他1が新しい記事を書いたよ",
      body: "記事タイトル",
      url: "/articles/article-1"
    )
  end

  context "投稿者名がないとき" do
    let(:article) { { id: "article-1", title: "記事タイトル", author: nil } }

    it "汎用文言で通知する" do
      result

      expect(notification_service).to have_received(:call).with(
        subscription:,
        title: "新しい記事が公開されたよ",
        body: "記事タイトル",
        url: "/articles/article-1"
      )
    end
  end

  [ WebPush::ExpiredSubscription, WebPush::InvalidSubscription ].each do |error_class|
    context "#{error_class}のとき" do
      before do
        response = instance_double(Net::HTTPGone, body: "gone", code: "410", message: "Gone")
        allow(notification_service).to receive(:call).and_raise(error_class.new(response, "push.example.test"))
      end

      it "無効な購読を削除して集計する" do
        expect(result).to eq(described_class::Result.new(sent_count: 0, removed_count: 1, failed_count: 0))
        expect(subscriptions_service).to have_received(:delete).with(id: "subscription-1")
      end

      it "削除失敗を記録して処理を継続する" do
        allow(subscriptions_service).to receive(:delete).and_raise(StandardError, "delete failed")

        expect(result).to eq(described_class::Result.new(sent_count: 0, removed_count: 0, failed_count: 1))
        expect(logger).to have_received(:warn).with(/subscription_id=subscription-1 error=StandardError/)
      end
    end
  end

  it "一件の送信失敗後も残りの購読に通知する" do
    next_subscription = { id: "subscription-2" }
    allow(subscriptions_service).to receive(:execute).and_return([ subscription, next_subscription ])
    allow(notification_service).to receive(:call).with(subscription:, **WebPush::ArticleNotificationPayload.call(article:))
      .and_raise(StandardError, "delivery failed")

    expect(result).to eq(described_class::Result.new(sent_count: 1, removed_count: 0, failed_count: 1))
    expect(logger).to have_received(:warn).with(/subscription_id=subscription-1 error=StandardError/)
  end

  it "購読がなければ全件ゼロで返す" do
    allow(subscriptions_service).to receive(:execute).and_return([])

    expect(result).to eq(described_class::Result.new(sent_count: 0, removed_count: 0, failed_count: 0))
    expect(notification_service).not_to have_received(:call)
  end
end
