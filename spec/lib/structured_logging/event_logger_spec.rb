require "rails_helper"

RSpec.describe StructuredLogging::EventLogger do
  let(:logger) { instance_double(Logger, info: nil, warn: nil, error: nil) }

  before do
    allow(Rails).to receive(:logger).and_return(logger)
    CurrentRequest.reset
  end

  after { CurrentRequest.reset }

  describe ".request_completed" do
    it "クエリ文字列を除外して成功ログを出力する" do
      described_class.request_completed(
        payload: { method: "GET", path: "/search?q=private", status: 200, request_id: "request-123" },
        duration_ms: 12.34
      )

      expect(logger).to have_received(:info).with(
        a_string_including("request_completed", "method=GET", "path=/search", "status=200", "duration_ms=12.3", "request_id=request-123")
      )
      expect(logger).not_to have_received(:info).with(include("private"))
    end

    it "4xxをwarn、5xxをerrorで出力する" do
      described_class.request_completed(payload: { status: 404 }, duration_ms: 1)
      described_class.request_completed(payload: { status: 503 }, duration_ms: 1)

      expect(logger).to have_received(:warn).with(include("status=404"))
      expect(logger).to have_received(:error).with(include("status=503"))
    end

    it "通知payloadにないリクエスト文脈を補完する" do
      CurrentRequest.set(request_id: "request-123", path: "/search") do
        described_class.request_completed(payload: { method: "GET", status: 200 }, duration_ms: 1)
      end

      expect(logger).to have_received(:info).with(
        a_string_including("path=/search", "request_id=request-123")
      )
    end
  end

  describe ".microcms_failure" do
    it "リクエスト文脈を含め、機微情報を出力しない" do
      CurrentRequest.set(request_id: "request-123", path: "/api/app/users/user-1") do
        described_class.microcms_failure(error_type: "upstream_http_error", upstream_status: 503)
      end

      expect(logger).to have_received(:error).with(
        a_string_including("microcms_request_failed", "service=microcms", "error_type=upstream_http_error", "upstream_status=503", "request_id=request-123", "path=/api/app/users/user-1")
      )
    end
  end

  describe ".navigation_failure" do
    it "失敗したリクエストIDと記録送信のIDを区別する" do
      CurrentRequest.set(request_id: "report-123") do
        described_class.navigation_failure(payload: { kind: "http_exception", path: "/authors", status: 502, response_request_id: "failed-123" })
      end

      expect(logger).to have_received(:warn).with(
        a_string_including("navigation_failed", "response_request_id=failed-123", "report_request_id=report-123")
      )
    end
  end
  it "本番では数値とBooleanの型を保ったJSONを出力し、未設定項目を省略する" do
    allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("production"))
    CurrentRequest.set(request_id: "report-123") do
      described_class.navigation_failure(payload: { kind: "network_error", elapsed_ms: 0, online: false, status: nil })
    end

    expect(logger).to have_received(:warn) { |message|
      expect(JSON.parse(message)).to eq(
        "kind" => "network_error", "elapsed_ms" => 0, "online" => false,
        "event" => "navigation_failed", "report_request_id" => "report-123"
      )
    }
  end

  [ [ 399, :info ], [ 400, :warn ], [ 499, :warn ], [ 500, :error ] ].each do |status, level|
    it "ステータス#{status}を#{level}で記録する" do
      described_class.request_completed(payload: { status: status }, duration_ms: 1)

      expect(logger).to have_received(level).with(include("status=#{status}"))
    end
  end

  it "microCMSの警告にも現在のリクエスト文脈を付ける" do
    CurrentRequest.set(request_id: "warning-id", path: "/authors") do
      described_class.microcms_warning(error_type: "fixture_warning")
    end

    expect(logger).to have_received(:warn).with(a_string_including("microcms_request_warning", "request_id=warning-id", "path=/authors"))
  end

  it "payload内の予約キーで診断イベントと送信IDを上書きさせない" do
    allow(Rails).to receive(:env).and_return(ActiveSupport::StringInquirer.new("production"))
    CurrentRequest.set(request_id: "actual-id") do
      described_class.navigation_failure(payload: { kind: "network_error", event: "forged", report_request_id: "forged" })
    end

    expect(logger).to have_received(:warn) { |message|
      expect(JSON.parse(message)).to include("event" => "navigation_failed", "report_request_id" => "actual-id")
    }
  end
end
