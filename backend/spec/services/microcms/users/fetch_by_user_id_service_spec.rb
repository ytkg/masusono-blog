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

    before do
      stub_microcms_api_key
    end

    context "取得成功時" do
      before do
        stub_request(:get, content_url)
          .with(headers: microcms_request_headers)
          .to_return(
            status: 200,
            body: {
              id: content_id,
              user_id: "cookie-user",
              name: "表示名太郎"
            }.to_json,
            headers: json_response_headers
          )
      end

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

      before do
        stub_request(:get, content_url)
          .with(headers: microcms_request_headers)
          .to_return(status: 200, body: { id: content_id, user_id: "cookie-user", name: "表示名太郎" }.to_json)
      end

      it do
        expect(result).to eq(id: content_id, user_id: "cookie-user", name: "表示名太郎")
      end
    end

    context "対象がない場合" do
      before do
        stub_request(:get, content_url)
          .with(headers: microcms_request_headers)
          .to_return(
            status: 404,
            body: { message: "Not found" }.to_json,
            headers: json_response_headers
          )
      end

      it do
        expect(result).to eq({})
      end
    end

    context "取得失敗時" do
      before do
        stub_request(:get, content_url)
          .with(headers: microcms_request_headers)
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
