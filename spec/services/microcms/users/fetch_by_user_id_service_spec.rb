require "rails_helper"

RSpec.describe Microcms::Users::FetchByUserIdService do
  describe ".execute" do
    subject(:result) { service_class.execute(user_id: user_id) }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/users".freeze)
      stub_const("Microcms::TestUsersFetchByUserIdService", klass)
    end
    let(:endpoint) { service_class::ENDPOINT }
    let(:user_id) { "cookie-user" }
    let(:content_id) { Microcms::Users::Identity.content_id("cookie-user") }
    let(:content_url) { "#{endpoint}/#{content_id}" }
    let(:response_status) { 200 }
    let(:response_body) { { id: content_id, user_id: "cookie-user", name: "表示名太郎" }.to_json }
    let(:response_headers) { json_response_headers }

    before do
      stub_microcms_api_key
      stub_request(:get, content_url)
        .with(headers: microcms_request_headers)
        .to_return(status: response_status, body: response_body, headers: response_headers)
    end

    context "取得成功時" do
      it do
        expect(result).to eq(
          {
            id: content_id,
            user_id: "cookie-user",
            name: "表示名太郎"
          }
        )
      end
    end

    context "user_idの前後に空白がある場合" do
      let(:user_id) { "  cookie-user  " }
      let(:response_headers) { {} }

      it do
        expect(result).to eq(id: content_id, user_id: "cookie-user", name: "表示名太郎")
      end
    end

    context "対象がない場合" do
      let(:response_status) { 404 }
      let(:response_body) { { message: "Not found" }.to_json }

      it do
        expect(result).to eq({})
      end
    end

    context "取得失敗時" do
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
