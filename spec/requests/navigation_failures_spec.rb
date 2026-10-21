require "rails_helper"

RSpec.describe "Navigation failure reports", type: :request do
  let(:failure) do
    {
      kind: "http_exception", path: "/authors?q=private", source_path: "/search?q=private",
      status: 502, response_request_id: "request-123", content_type: "text/html",
      prefetch: false, prefetch_in_flight: true, elapsed_ms: 350, online: true, service_worker: false
    }
  end

  before do
    allow(StructuredLogging::EventLogger).to receive(:navigation_failure)
  end

  it "許可した診断項目だけを記録して204を返す" do
    post "/api/app/navigation_failures", params: { failure: failure.merge(body: "secret") }, as: :json

    expect(response).to have_http_status(:no_content)
    expect(response.headers["Cache-Control"]).to include("no-store")
    expect(response.headers["X-Request-Id"]).to be_present
    expect(StructuredLogging::EventLogger).to have_received(:navigation_failure).with(payload: {
      kind: "http_exception", path: "/authors", source_path: "/search", status: 502,
      response_request_id: "request-123", content_type: "text/html", prefetch: false,
      prefetch_in_flight: true, elapsed_ms: 350, online: true, service_worker: false
    })
  end

  it "PWA遷移の段階・復旧情報を既存の共通ヘッダーで受理する" do
    trace = {
      kind: "navigation_stalled", path: "/numbers", stage: "module_start", standalone: true,
      build_version: "202610211600", controller_state: "activated", data_source: "cached", visibility: "visible",
      tap_ms: 0, request_ms: 1, response_ms: 1, data_ready_ms: 2, module_start_ms: 3,
      since_resume_ms: 100, elapsed_ms: 5000, backgrounded: true, recovered: true
    }
    post "/api/app/navigation_failures", params: { failure: trace.merge(module_end_ms: "secret", body: "private") }, as: :json

    expect(response).to have_http_status(:no_content)
    expect(response.headers["Cache-Control"]).to include("no-store")
    expect(response.headers["X-Request-Id"]).to be_present
    expect(StructuredLogging::EventLogger).to have_received(:navigation_failure).with(payload: trace)
  end

  it "開始時刻が不明な記録は経過時間なしでも受理する" do
    post "/api/app/navigation_failures", params: { failure: failure.except(:elapsed_ms) }, as: :json

    expect(response).to have_http_status(:no_content)
    expect(response.headers["Cache-Control"]).to include("no-store")
    expect(response.headers["X-Request-Id"]).to be_present
    expect(StructuredLogging::EventLogger).to have_received(:navigation_failure).with(
      payload: hash_excluding(:elapsed_ms)
    )
  end

  it "不正な診断種別を共通エラー形式で拒否する" do
    post "/api/app/navigation_failures", params: { failure: { kind: "other" } }, as: :json

    expect(response).to have_http_status(:bad_request)
    expect(response.parsed_body.dig("error", "code")).to eq("invalid_request")
    expect(response.parsed_body.dig("error", "request_id")).to be_present
    expect(StructuredLogging::EventLogger).not_to have_received(:navigation_failure)
  end

  it "過大な記録を拒否する" do
    post "/api/app/navigation_failures", params: { failure: failure.merge(body: "x" * 3000) }, as: :json

    expect(response).to have_http_status(:content_too_large)
    expect(StructuredLogging::EventLogger).not_to have_received(:navigation_failure)
  end
  it "診断オブジェクト以外の入力を拒否する" do
    post "/api/app/navigation_failures", params: { failure: "invalid" }, as: :json

    expect(response).to have_http_status(:bad_request)
    expect(StructuredLogging::EventLogger).not_to have_received(:navigation_failure)
  end

  it "同一IPからの大量送信を制限する" do
    21.times do
      post "/api/app/navigation_failures", params: { failure: }, headers: { "REMOTE_ADDR" => "192.0.2.10" }, as: :json
    end

    expect(response).to have_http_status(:too_many_requests)
    expect(response.headers["Cache-Control"]).to include("no-store")
    expect(response.parsed_body.dig("error", "code")).to eq("rate_limited")
    expect(StructuredLogging::EventLogger).to have_received(:navigation_failure).exactly(20).times
  end
end
