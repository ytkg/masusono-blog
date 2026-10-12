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
