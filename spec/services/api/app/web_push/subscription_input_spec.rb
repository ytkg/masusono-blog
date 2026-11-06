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
  [ nil, [], "subscription" ].each do |value|
    context "購読オブジェクトが#{value.inspect}の場合" do
      let(:subscription) { value }
      it { expect { result }.to raise_error(ArgumentError, "subscription is required") }
    end
  end

  [ "https://web.push.apple.com.evil/id", "https://example.com/id", "https://web.push.apple.com/%ZZ" ].each do |endpoint|
    context "配信先が不正な#{endpoint}の場合" do
      let(:subscription) { super().merge("endpoint" => endpoint) }
      it { expect { result }.to raise_error(ArgumentError, "subscription endpoint is invalid") }
    end
  end

  context "鍵が許容上限の場合" do
    let(:subscription) { super().merge("keys" => { "p256dh" => "x" * 1_000, "auth" => "y" * 1_000 }) }
    it { is_expected.to eq([ "https://web.push.apple.com/push/id", "x" * 1_000, "y" * 1_000 ]) }
  end

  context "auth鍵が上限を超える場合" do
    let(:subscription) { super().merge("keys" => { "p256dh" => "key", "auth" => "x" * 1_001 }) }
    it { expect { result }.to raise_error(ArgumentError, "subscription auth is too long") }
  end

  context "鍵が欠落している場合" do
    let(:subscription) { super().except("keys") }
    it { expect { result }.to raise_error(ArgumentError, "subscription p256dh is required") }
  end

  %w[android.googleapis.com fcm.googleapis.com updates.push.services.mozilla.com web.push.apple.com].each do |host|
    context "許可した配信先#{host}の場合" do
      let(:subscription) { { endpoint: "https://#{host}/id", keys: { p256dh: "key", auth: "auth" } } }
      it { is_expected.to eq([ "https://#{host}/id", "key", "auth" ]) }
    end
  end

  [ 2_000, 2_001 ].each do |length|
    context "endpointが#{length}文字の場合" do
      let(:endpoint) { "https://web.push.apple.com/".ljust(length, "x") }
      let(:subscription) { super().merge("endpoint" => endpoint) }

      it "長さ上限を厳密に適用する" do
        if length == 2_000
          expect(result).to eq([ endpoint, "key", "auth" ])
        else
          expect { result }.to raise_error(ArgumentError, "subscription endpoint is too long")
        end
      end
    end
  end

  [ "endpoint", "p256dh", "auth" ].each do |field|
    [ nil, "", " \t\n " ].each do |value|
      context "#{field}が#{value.inspect}の場合" do
        let(:subscription) do
          input = super()
          field == "endpoint" ? input.merge(field => value) : input.merge("keys" => input["keys"].merge(field => value))
        end

        it { expect { result }.to raise_error(ArgumentError, "subscription #{field} is required") }
      end
    end
  end
end
