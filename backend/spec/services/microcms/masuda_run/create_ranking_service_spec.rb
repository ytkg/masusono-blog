require "rails_helper"

RSpec.describe Microcms::MasudaRun::CreateRankingService do
  describe ".execute" do
    subject(:result) { service_class.execute(user_id: user_id, score: score) }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/masudarunkings".freeze)
      stub_const("Microcms::MasudaRun::TestCreateRankingService", klass)
    end
    let(:endpoint) { service_class::ENDPOINT }
    let(:user_id) { "cookie-user" }
    let(:score) { 1234 }

    before do
      stub_microcms_api_key
    end

    context "登録成功時" do
      before do
        stub_request(:post, endpoint)
          .with(
            headers: {
              "Accept" => "application/json",
              "Content-Type" => "application/json",
              "X-MICROCMS-API-KEY" => "test-api-key"
            },
            body: { user_id: user_id, score: score }.to_json
          )
          .to_return(
            status: 201,
            body: { id: "new-ranking-id" }.to_json,
            headers: json_response_headers
          )
      end

      it do
        expect(result).to eq({ id: "new-ranking-id" })
      end
    end

    context "登録失敗時" do
      before do
        stub_request(:post, endpoint)
          .to_return(status: 503, body: "upstream unavailable", headers: json_response_headers)
      end

      it do
        expect { result }.to raise_error(
          Microcms::FetchContentsService::FetchError,
          "microCMS request failed: status=503"
        )
      end
    end
  end
end
