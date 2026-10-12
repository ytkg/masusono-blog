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
end
