require "rails_helper"

RSpec.describe StructuredLogging::RequestSubscriber do
  it "一度だけ購読し、処理完了イベントのpayloadと所要時間を記録する" do
    subscriber_class = Class.new(described_class)
    subscription = nil
    allow(ActiveSupport::Notifications).to receive(:subscribe).and_wrap_original do |original, *args, &block|
      subscription = original.call(*args, &block)
    end
    allow(StructuredLogging::EventLogger).to receive(:request_completed)
    payload = { method: "GET", path: "/search", status: 200 }

    2.times { subscriber_class.install! }
    ActiveSupport::Notifications.instrument("process_action.action_controller", payload)

    expect(ActiveSupport::Notifications).to have_received(:subscribe).with("process_action.action_controller").once
    expect(StructuredLogging::EventLogger).to have_received(:request_completed).with(payload:, duration_ms: a_kind_of(Numeric)).once
  ensure
    ActiveSupport::Notifications.unsubscribe(subscription) if subscription
  end
end
