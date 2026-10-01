require "rails_helper"

RSpec.describe Api::App::WebPush::SubscriptionsShowUsecase do
  subject(:result) { described_class.call(endpoint:) }

  let(:endpoint) { "https://fcm.googleapis.com/fcm/send/example" }
  let(:subscriptions) { [ { endpoint: } ] }

  before do
    allow(Microcms::WebPushSubscriptionsService).to receive(:execute)
      .with(filters: "endpoint[equals]#{endpoint.to_s.strip}").and_return(subscriptions)
  end

  it "配信対象に登録されたendpointは購読中として返す" do
    expect(result).to eq(json: { subscribed: true }, status: :ok)
  end

  context "登録されていない場合" do
    let(:subscriptions) { [] }

    it "未購読として返す" do
      expect(result).to eq(json: { subscribed: false }, status: :ok)
    end
  end

  context "別のendpointが返った場合" do
    let(:subscriptions) { [ { endpoint: "https://fcm.googleapis.com/fcm/send/other" } ] }

    it "未購読として返す" do
      expect(result).to eq(json: { subscribed: false }, status: :ok)
    end
  end

  context "endpointが空の場合" do
    let(:endpoint) { " " }

    it "入力エラーにする" do
      expect { result }.to raise_error(ArgumentError, "subscription endpoint is required")
    end
  end
end
