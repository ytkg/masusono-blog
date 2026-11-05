require "bundler/setup"
require "webmock"
WebMock.disable_net_connect!
require_relative "../../config/environment"

diagnostic = Rack::MockRequest.new(Rails.application).post(
  "/api/app/navigation_failures", "HTTP_HOST" => "masusono.com", "HTTPS" => "on",
  "HTTP_X_REQUEST_ID" => "report-id", "CONTENT_TYPE" => "application/json",
  input: JSON.generate(failure: {
    kind: "network_error", path: "/search?q=private-search", response_request_id: "failed-id",
    body: "private-body", token: "private-token"
  })
)

observed = []
app = lambda do |env|
  request = ActionDispatch::Request.new(env)
  observed << { id: CurrentRequest.request_id, path: CurrentRequest.path, request_id: request.request_id }
  StructuredLogging::EventLogger.microcms_failure(error_type: "fixture_failure", upstream_status: 503)
  StructuredLogging::EventLogger.navigation_failure(payload: { kind: "network_error", path: "/authors" })
  raise "fixture failure" if request.path == "/raise"

  [ 200, { "content-type" => "text/plain" }, [ "ok" ] ]
end
stack = Rails.application.middleware.build(app)
client = Rack::MockRequest.new(stack)
requests = [ [ "/search?q=private", "first-id" ], [ "/authors", "second-id" ], [ "/numbers", nil ], [ "/raise", "error-id" ] ]
responses = requests.map do |path, id|
  headers = { "HTTP_HOST" => "masusono.com", "HTTPS" => "on" }
  headers["HTTP_X_REQUEST_ID"] = id if id
  response = client.get(path, headers)
  { status: response.status, id: response["x-request-id"], after_id: CurrentRequest.request_id, after_path: CurrentRequest.path }
end
puts "PROBE_RESULT=#{JSON.generate(observed:, responses:, diagnostic: { status: diagnostic.status, id: diagnostic["x-request-id"] }, middleware: Rails.application.middleware.map { |entry| entry.klass.name })}"
