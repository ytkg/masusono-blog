require "rails_helper"

RSpec.describe Api::App::WebPush::SubscriptionInput do
  subject(:result) { described_class.call(subscription:) }

  let(:subscription) do
    { "endpoint" => " https://web.push.apple.com/push/id ", "keys" => { "p256dh" => " key ", "auth" => " auth " } }
  end

  it "文字列キーと空白を正規化する" do
    expect(result).to eq([ "https://web.push.apple.com/push/id", "key", "auth" ])
  end

  context "コントローラのパラメータの場合" do
    let(:subscription) { ActionController::Parameters.new(endpoint: "https://fcm.googleapis.com/id", keys: { p256dh: "key", auth: "auth" }) }

    it "シンボルキーと同じ入力として扱う" do
      expect(result).to eq([ "https://fcm.googleapis.com/id", "key", "auth" ])
    end
  end

  context "HTTPSでない場合" do
    let(:subscription) { { endpoint: "http://web.push.apple.com/id", keys: { p256dh: "key", auth: "auth" } } }

    it "拒否する" do
      expect { result }.to raise_error(ArgumentError, "subscription endpoint is invalid")
    end
  end

  context "鍵が長すぎる場合" do
    let(:subscription) { { endpoint: "https://web.push.apple.com/id", keys: { p256dh: "x" * 1_001, auth: "auth" } } }

    it "保存前に拒否する" do
      expect { result }.to raise_error(ArgumentError, "subscription p256dh is too long")
    end
  end
end
