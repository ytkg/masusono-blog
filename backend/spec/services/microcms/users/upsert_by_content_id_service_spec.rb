require "rails_helper"

RSpec.describe Microcms::Users::UpsertByContentIdService do
  describe ".execute" do
    subject(:result) { service_class.execute(content_id:, user_id:, name:) }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/users".freeze)
      stub_const("Microcms::TestUsersUpsertByContentIdService", klass)
    end
    let(:content_id) { "u-2bd806c97f0e00af1a1fc3328fa763a9" }
    let(:user_id) { "alice" }
    let(:name) { "表示名太郎" }
    let(:endpoint) { "#{service_class::ENDPOINT}/#{content_id}" }

    before do
      stub_microcms_api_key
    end

    it "指定したコンテンツIDへPUTする" do
      stub_request(:put, endpoint)
        .with(
          headers: microcms_write_request_headers,
          body: { user_id:, name: }.to_json
        )
        .to_return(status: 200, body: { id: content_id }.to_json, headers: json_response_headers)

      expect(result).to eq({ id: content_id, user_id:, name: })
    end

    it "コンテンツIDが既存の場合はPATCHで更新する" do
      stub_request(:put, endpoint)
        .to_return(status: 400, body: "Content is already exists. If you want update, please use PATCH request.")
      stub_request(:patch, endpoint)
        .with(
          headers: microcms_write_request_headers,
          body: { user_id:, name: }.to_json
        )
        .to_return(status: 200, body: { id: content_id }.to_json, headers: json_response_headers)

      expect(result).to eq({ id: content_id, user_id:, name: })
    end

    it "microCMSのエラーを送出する" do
      stub_request(:put, endpoint).to_return(status: 503, body: "upstream unavailable", headers: json_response_headers)

      expect { result }.to raise_error(
        Microcms::FetchContentsService::FetchError,
        "microCMS request failed: status=503"
      )
    end
  end
end
