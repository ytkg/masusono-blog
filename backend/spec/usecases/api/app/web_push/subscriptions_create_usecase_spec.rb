require "rails_helper"

RSpec.describe Api::App::WebPush::SubscriptionsCreateUsecase do
  subject(:result) { described_class.call(subscription:) }

  let(:subscription) do
    { endpoint: "https://fcm.googleapis.com/fcm/send/example", keys: { p256dh: "p256dh", auth: "auth" } }
  end

  before do
    allow(Microcms::WebPushSubscriptionsService).to receive(:upsert).and_return(id: "subscription-id")
  end

  it "正規化したsubscriptionを保存する" do
    expect(result).to eq(json: { id: "subscription-id" }, status: :created)
    expect(Microcms::WebPushSubscriptionsService).to have_received(:upsert).with(
      endpoint: "https://fcm.googleapis.com/fcm/send/example", p256dh: "p256dh", auth: "auth"
    )
  end

  it "非Pushサービスのendpointを拒否する" do
    subscription[:endpoint] = "https://example.com/internal"

    expect { result }.to raise_error(ArgumentError, "subscription endpoint is invalid")
  end

  it "鍵がないsubscriptionを拒否する" do
    subscription[:keys].delete(:auth)

    expect { result }.to raise_error(ArgumentError, "subscription auth is required")
  end
end
