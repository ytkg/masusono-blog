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

  context "成功・期限切れ・配信失敗が混在する場合" do
    let(:subscriptions) do
      [ subscription, { id: "expired" }, { id: "failed" }, { id: "last" } ]
    end

    before do
      allow(subscriptions_service).to receive(:execute).and_return(subscriptions)
      response = instance_double(Net::HTTPGone, body: "gone", code: "410", message: "Gone")
      allow(notification_service).to receive(:call).with(subscription: subscriptions[1], **WebPush::ArticleNotificationPayload.call(article:))
        .and_raise(WebPush::ExpiredSubscription.new(response, "private-endpoint.example"))
      allow(notification_service).to receive(:call).with(subscription: subscriptions[2], **WebPush::ArticleNotificationPayload.call(article:))
        .and_raise(StandardError, "private endpoint and keys")
    end

    it "最後まで配信し、成功・削除・失敗を重複せず集計する" do
      expect(result).to eq(described_class::Result.new(sent_count: 2, removed_count: 1, failed_count: 1))
      expect(subscriptions_service).to have_received(:delete).with(id: "expired").once
      expect(logger).to have_received(:warn).with(
        "[WebPush::ArticlePublishedNotifier] delivery failed subscription_id=failed error=StandardError"
      ).once
    end

    it "期限切れ購読の削除に失敗しても後続に配信し、秘密をログに含めない" do
      allow(subscriptions_service).to receive(:delete).with(id: "expired").and_raise(StandardError, "private credentials")

      expect(result).to eq(described_class::Result.new(sent_count: 2, removed_count: 0, failed_count: 2))
      expect(logger).to have_received(:warn).with(
        "[WebPush::ArticlePublishedNotifier] delivery failed subscription_id=expired error=StandardError"
      )
      expect(logger).to have_received(:warn).with(
        "[WebPush::ArticlePublishedNotifier] delivery failed subscription_id=failed error=StandardError"
      )
    end
  end

  it "購読一覧の取得失敗を配信成功や空の結果として扱わない" do
    allow(subscriptions_service).to receive(:execute).and_raise(Faraday::TimeoutError)

    expect { result }.to raise_error(Faraday::TimeoutError)
    expect(notification_service).not_to have_received(:call)
  end
end
