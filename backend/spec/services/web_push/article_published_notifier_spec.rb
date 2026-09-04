require "rails_helper"

RSpec.describe WebPush::ArticlePublishedNotifier do
  let(:article) { { id: "article-1", title: "記事タイトル", author: { name: "その他1" } } }
  let(:subscription) { { id: "subscription-1" } }
  let(:subscriptions_service) { class_double(Microcms::WebPushSubscriptionsService, execute: [ subscription ]) }
  let(:notification_service) { class_double(WebPush::SendNotificationService, call: nil) }

  subject(:result) do
    described_class.call(
      article:,
      subscriptions_service:,
      notification_service:
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
end
