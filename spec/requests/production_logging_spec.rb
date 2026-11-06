require "rails_helper"
require "open3"

RSpec.describe "Production logging middleware" do
  it "本番設定のrequest IDをアプリとログへ渡し、連続リクエストや例外の後に残さない" do
    stdout, stderr, status = Open3.capture3(
      { "RAILS_ENV" => "production", "SECRET_KEY_BASE_DUMMY" => "1", "RAILS_LOG_LEVEL" => "info", "SKYLIGHT_ENABLED" => "false", "SKYLIGHT_DISABLE_AGENT" => "true" },
      "bundle", "exec", "ruby", Rails.root.join("spec/fixtures/production_logging_probe.rb").to_s,
      chdir: Rails.root.to_s
    )
    expect(status.success?).to be(true), stderr
    marker = stdout.lines.find { |line| line.start_with?("PROBE_RESULT=") }
    expect(marker).to be_present
    result = JSON.parse(marker.delete_prefix("PROBE_RESULT="))
    middleware = result.fetch("middleware")

    observed = result.fetch("observed")
    responses = result.fetch("responses")
    expect(observed.map { |entry| entry.fetch("path") }).to eq([ "/search", "/authors", "/numbers", "/raise" ])
    expect(middleware.index("StructuredLogging::RequestContext")).to be > middleware.index("ActionDispatch::RequestId")
    expect(observed.map { |entry| entry.fetch("id") }).to eq(responses.map { |entry| entry.fetch("id") })
    expect(observed.map { |entry| entry.fetch("request_id") }).to eq(responses.map { |entry| entry.fetch("id") })
    expect(responses.map { |entry| entry.fetch("status") }).to eq([ 200, 200, 200, 500 ])
    expect(responses[0].fetch("id")).to eq("first-id")
    expect(responses[1].fetch("id")).to eq("second-id")
    expect(responses[2].fetch("id")).to be_present
    expect(responses.map { |entry| entry.fetch("id") }.uniq.size).to eq(4)
    expect(responses[3].fetch("id")).to eq("error-id")
    expect(responses.map { |entry| entry.values_at("after_id", "after_path") }).to eq(Array.new(4) { [ nil, nil ] })

    logs = stdout.lines.reject { |line| line.start_with?("PROBE_RESULT=") }.filter_map do |line|
      begin
        JSON.parse(line)
      rescue JSON::ParserError
        nil
      end
    end
    failures = logs.select { |entry| entry["event"] == "microcms_request_failed" }
    reports = logs.select { |entry| entry["event"] == "navigation_failed" }
    expect(failures.map { |entry| entry.fetch("request_id") }).to eq(responses.map { |entry| entry.fetch("id") })
    expect(reports.map { |entry| entry.fetch("report_request_id") }).to eq([ "report-id", *responses.map { |entry| entry.fetch("id") } ])
    expect(failures.map { |entry| entry.fetch("path") }).to eq([ "/search", "/authors", "/numbers", "/raise" ])
    expect(result.fetch("diagnostic")).to eq("status" => 204, "id" => "report-id")
    expect(reports.first).to include("path" => "/search", "response_request_id" => "failed-id")
    completed = logs.find { |entry| entry["event"] == "request_completed" && entry["request_id"] == "report-id" }
    expect(completed).to include("status" => 204, "path" => "/api/app/navigation_failures")
    expect(logs.any? { |entry| entry["message"].to_s.include?("Parameters:") && entry["message"].include?("[FILTERED]") }).to be(true)
    expect(stdout).not_to include("private-search", "private-body", "private-token")
  end
end
