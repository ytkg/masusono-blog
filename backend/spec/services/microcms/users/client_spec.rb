require "rails_helper"

RSpec.describe Microcms::Users::Client do
  describe "#fetch_contents" do
    subject(:result) { client.fetch_contents(filters:, limit:) }

    let(:endpoint) { "https://example.test/api/v1/users" }
    let(:filters) { "user_id[equals]cookie-user" }
    let(:limit) { 1 }
    let(:client) { described_class.new(endpoint:, api_key: "test-api-key") }
    let(:query) { { "limit" => "1", "filters" => filters } }
    let(:contents) { [ { "id" => "u_1", "user_id" => "cookie-user", "name" => "表示名太郎" } ] }
    let(:response_status) { 200 }
    let(:response_body) { { contents: }.to_json }

    before do
      stub_request(:get, endpoint)
        .with(query:, headers: microcms_request_headers)
        .to_return(status: response_status, body: response_body, headers: json_response_headers)
    end

    context "正常なcontents配列が返る場合" do
      it do
        expect(result).to eq(contents)
      end
    end

    context "contentsが配列でない場合" do
      let(:contents) { { "id" => "u_1" } }

      it do
        expect(result).to eq([])
      end
    end

    context "JSONが不正な場合" do
      let(:response_body) { "not json" }

      it do
        expect(result).to eq([])
      end
    end

    context "microCMSが失敗した場合" do
      let(:response_status) { 503 }
      let(:response_body) { "upstream unavailable" }

      it do
        expect { result }.to raise_error(
          Microcms::FetchContentsService::FetchError,
          "microCMS request failed: status=503"
        )
      end
    end
  end
end
