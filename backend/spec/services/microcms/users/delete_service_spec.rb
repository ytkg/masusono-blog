require "rails_helper"

RSpec.describe Microcms::Users::DeleteService do
  describe ".execute" do
    subject(:result) { service_class.execute(content_id:) }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/users".freeze)
      stub_const("Microcms::TestUsersDeleteService", klass)
    end
    let(:content_id) { "legacy-user-id" }
    let(:endpoint) { "#{service_class::ENDPOINT}/#{content_id}" }

    before do
      stub_microcms_api_key
    end

    it "指定したコンテンツIDをDELETEする" do
      stub_request(:delete, endpoint)
        .with(headers: { "Accept" => "application/json", "X-MICROCMS-API-KEY" => "test-api-key" })
        .to_return(status: 204)

      expect(result).to eq({ id: content_id })
    end

    it "microCMSのエラーを送出する" do
      stub_request(:delete, endpoint).to_return(status: 503, body: "upstream unavailable", headers: json_response_headers)

      expect { result }.to raise_error(
        Microcms::FetchContentsService::FetchError,
        "microCMS request failed: status=503, body=upstream unavailable"
      )
    end
  end
end
