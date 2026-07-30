require "rails_helper"

RSpec.describe Microcms::Users::Client do
  describe "#fetch_contents" do
    subject(:result) { client.fetch_contents(filters:, limit:) }

    let(:endpoint) { "https://example.test/api/v1/users" }
    let(:filters) { "user_id[equals]cookie-user" }
    let(:limit) { 1 }
    let(:client) { described_class.new(endpoint:, api_key: "test-api-key") }
    let(:query) { { "limit" => "1", "filters" => filters } }

    context "正常なcontents配列が返る場合" do
      let(:contents) { [ { "id" => "u_1", "user_id" => "cookie-user", "name" => "表示名太郎" } ] }

      before do
        stub_request(:get, endpoint)
          .with(query:, headers: microcms_request_headers)
          .to_return(
            status: 200,
            body: { contents: }.to_json,
            headers: json_response_headers
          )
      end

      it do
        expect(result).to eq(contents)
      end
    end

    context "contentsが配列でない場合" do
      before do
        stub_request(:get, endpoint)
          .with(query:, headers: microcms_request_headers)
          .to_return(
            status: 200,
            body: { contents: { "id" => "u_1" } }.to_json,
            headers: json_response_headers
          )
      end

      it do
        expect(result).to eq([])
      end
    end

    context "JSONが不正な場合" do
      before do
        stub_request(:get, endpoint)
          .with(query:, headers: microcms_request_headers)
          .to_return(status: 200, body: "not json", headers: json_response_headers)
      end

      it do
        expect(result).to eq([])
      end
    end

    context "microCMSが失敗した場合" do
      before do
        stub_request(:get, endpoint)
          .with(query:, headers: microcms_request_headers)
          .to_return(status: 503, body: "upstream unavailable", headers: json_response_headers)
      end

      it do
        expect { result }.to raise_error(
          Microcms::FetchContentsService::FetchError,
          "microCMS request failed: status=503, body=upstream unavailable"
        )
      end
    end
  end
end
