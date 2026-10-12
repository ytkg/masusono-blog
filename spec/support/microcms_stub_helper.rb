module MicrocmsStubHelper
  def stub_microcms_get(endpoint:, query:, contents:, status: 200, total_count: contents.size, limit: 100, offset: 0)
    stub_microcms_api_key
    stub_request(:get, endpoint)
      .with(query:, headers: microcms_request_headers)
      .to_return(
        status:,
        body: microcms_response_body(contents:, total_count:, limit:, offset:),
        headers: json_response_headers
      )
  end

  def stub_microcms_api_key
    allow(Rails.application.credentials).to receive(:dig).with(:microcms, :api_key).and_return("test-api-key")
  end

  def microcms_request_headers
    {
      "Accept" => "application/json",
      "X-API-KEY" => "test-api-key"
    }
  end

  def microcms_write_request_headers
    {
      "Accept" => "application/json",
      "Content-Type" => "application/json",
      "X-MICROCMS-API-KEY" => "test-api-key"
    }
  end

  def microcms_response_body(contents:, total_count:, limit:, offset:)
    {
      contents:,
      totalCount: total_count,
      limit:,
      offset:
    }.to_json
  end

  def json_response_headers
    { "Content-Type" => "application/json" }
  end
end

RSpec.configure do |config|
  config.include MicrocmsStubHelper
end
