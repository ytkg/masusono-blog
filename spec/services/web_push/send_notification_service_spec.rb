require "rails_helper"

RSpec.describe WebPush::SendNotificationService do
  subject(:result) { described_class.call(subscription:, title: "新着記事", body: "記事本文", url: "/articles/one") }

  let(:subscription) { { endpoint: "https://push.example.test/one", p256dh: "subscription-key", auth: "auth-token" } }

  before do
    { vapid_subject: " mailto:push@example.test ", vapid_public_key: " public-key ", vapid_private_key: " private-key " }.each do |key, value|
      allow(Rails.application.credentials).to receive(:dig).with(:web_push, key).and_return(value)
    end
    allow(WebPush).to receive(:payload_send).and_return(:sent)
  end

  it "通知のJSONと購読情報とVAPID設定を渡す" do
    expect(result).to eq(:sent)
    expect(WebPush).to have_received(:payload_send).with(
      message: { title: "新着記事", body: "記事本文", url: "/articles/one" }.to_json,
      **subscription,
      vapid: { subject: "mailto:push@example.test", public_key: "public-key", private_key: "private-key" },
      ttl: 86_400, urgency: "normal"
    )
  end

  %i[vapid_subject vapid_public_key vapid_private_key].each do |key|
    [ nil, "  " ].each do |value|
      it "#{key}が#{value.inspect}なら送信しない" do
        allow(Rails.application.credentials).to receive(:dig).with(:web_push, key).and_return(value)

        expect { result }.to raise_error("web_push.#{key} is missing")
        expect(WebPush).not_to have_received(:payload_send)
      end
    end
  end

  it "送信エラーを呼び出し元に伝える" do
    allow(WebPush).to receive(:payload_send).and_raise(StandardError, "delivery failed")

    expect { result }.to raise_error(StandardError, "delivery failed")
  end
end
