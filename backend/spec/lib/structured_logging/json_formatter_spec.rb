require "rails_helper"

RSpec.describe StructuredLogging::JsonFormatter do
  subject(:formatted_log) { described_class.new.call(severity, timestamp, nil, message) }

  let(:severity) { "INFO" }
  let(:timestamp) { Time.utc(2026, 8, 31, 1, 2, 3, 456_000) }
  let(:message) { JSON.generate(event: "request_completed", path: "/search", request_id: "request-123") }

  it "構造化イベントを1行のJSONとして出力する" do
    expect(formatted_log).to end_with("\n")
    expect(formatted_log.count("\n")).to eq(1)
    expect(JSON.parse(formatted_log)).to eq(
      {
        "timestamp" => "2026-08-31T01:02:03.456Z",
        "severity" => "info",
        "event" => "request_completed",
        "path" => "/search",
        "request_id" => "request-123"
      }
    )
  end

  context "通常のRailsログの場合" do
    let(:message) { "Started GET \"/search\"" }

    it "messageフィールドを持つJSONとして出力する" do
      expect(JSON.parse(formatted_log)).to include(
        "severity" => "info",
        "message" => "Started GET \"/search\""
      )
    end
  end
end
