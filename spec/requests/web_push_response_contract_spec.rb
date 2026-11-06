require "rails_helper"

RSpec.describe "Web Push upstream IDs", type: :request do
  let(:cms_endpoint) { Microcms::WebPushSubscriptionsService::ENDPOINT }
  let(:push_endpoint) { "https://fcm.googleapis.com/id" }
  let(:subscription) { { endpoint: push_endpoint, keys: { p256dh: "key", auth: "auth" } } }

  before { stub_microcms_api_key }

  def expect_upstream_error
    expect(response).to have_http_status(:bad_gateway)
    expect(response.parsed_body).to eq("error" => {
      "code" => "upstream_server_error",
      "message" => ApplicationController::ERROR_MESSAGE_BY_CODE.fetch("upstream_server_error"),
      "request_id" => response.headers.fetch("X-Request-Id")
    })
    expect(response.headers["X-Request-Id"]).to be_present
    expect(response.headers["Cache-Control"]).to eq("no-store")
    expect(response.headers["ETag"]).to be_nil
  end

  [ "{", "[]", "null", "123", "true", "{}", *[ nil, "", "  ", 1, false, [], {} ].map { |id| { id: }.to_json } ].each do |body|
    it "作成の不正な成功応答#{body.inspect}は再送せず502にする" do
      stub_microcms_get(endpoint: cms_endpoint, query: hash_including({}), contents: [])
      creation = stub_request(:post, cms_endpoint).to_return(status: 201, body:)

      post "/api/app/web_push/subscription.json", params: { subscription: }, as: :json

      expect_upstream_error
      expect(creation).to have_been_requested.once
    end
  end

  [ {}, *[ nil, "", "  ", 1, false, [], {} ].map { |id| { id: } } ].each do |invalid|
    [ :post, :delete ].each do |method|
      it "#{method}のlookupに不正ID#{invalid.inspect}があれば書き込まない" do
        contents = method == :delete ? [ { id: "valid" }, invalid ] : [ invalid ]
        stub_microcms_get(endpoint: cms_endpoint, query: hash_including({}), contents:)
        stub_request(:delete, "#{cms_endpoint}/valid").to_return(status: 204)
        params = method == :post ? { subscription: } : { endpoint: push_endpoint }

        public_send(method, "/api/app/web_push/subscription.json", params:, as: :json)

        expect_upstream_error
        expect(a_request(:any, /web_push_subscriptions/).with { |request| [ :post, :patch, :delete ].include?(request.method) }).not_to have_been_made
      end
    end
  end

  it "正しいIDで作成し成功応答を返す" do
    stub_microcms_get(endpoint: cms_endpoint, query: hash_including({}), contents: [])
    stub_request(:post, cms_endpoint).to_return(status: 201, body: { id: "new-id" }.to_json)

    post "/api/app/web_push/subscription.json", params: { subscription: }, as: :json

    expect(response).to have_http_status(:created)
    expect(response.parsed_body).to eq("id" => "new-id")
  end
end
