require "rails_helper"

RSpec.describe Microcms::WebPushSubscriptionsService do
  let(:endpoint) { described_class::ENDPOINT }
  let(:attributes) { { endpoint: "https://push.example.test/subscription", p256dh: "public-key", auth: "auth-token" } }

  before { stub_microcms_api_key }

  describe ".upsert" do
    subject(:result) { described_class.upsert(**attributes) }

    let(:contents) { [] }

    before do
      stub_microcms_get(
        endpoint:, query: { limit: 100, offset: 0, orders: "-publishedAt", filters: "endpoint[equals]#{attributes[:endpoint]}" },
        contents:
      )
    end

    it "未登録の購読をJSONで作成する" do
      stub_request(:post, endpoint)
        .with(headers: microcms_write_request_headers, body: attributes.to_json)
        .to_return(status: 201, body: { id: "new-subscription" }.to_json)

      expect(result).to eq(id: "new-subscription")
    end

    context "登録済みのとき" do
      let(:contents) { [ { id: "existing-subscription" } ] }

      it "既存の購読の鍵を更新する" do
        stub_request(:patch, "#{endpoint}/existing-subscription")
          .with(headers: microcms_write_request_headers, body: attributes.to_json)
          .to_return(status: 200, body: "{}")

        expect(result).to eq(id: "existing-subscription")
      end
    end
  end

  describe ".delete_by_endpoint" do
    it "同じendpointの購読をすべて削除する" do
      stub_microcms_get(
        endpoint:, query: { limit: 100, offset: 0, orders: "-publishedAt", filters: "endpoint[equals]#{attributes[:endpoint]}" },
        contents: [ { id: "one" }, { id: "two" } ]
      )
      deletions = %w[one two].map do |id|
        stub_request(:delete, "#{endpoint}/#{id}")
          .with(headers: { "X-MICROCMS-API-KEY" => "test-api-key" })
          .to_return(status: 204)
      end

      described_class.delete_by_endpoint(endpoint: attributes[:endpoint])

      deletions.each { |request| expect(request).to have_been_requested.once }
    end

    it "一致する購読がなければ削除しない" do
      stub_microcms_get(
        endpoint:, query: { limit: 100, offset: 0, orders: "-publishedAt", filters: "endpoint[equals]#{attributes[:endpoint]}" },
        contents: []
      )

      expect(described_class.delete_by_endpoint(endpoint: attributes[:endpoint])).to eq([])
      expect(a_request(:delete, /web_push_subscriptions/)).not_to have_been_made
    end
  end

  describe "書き込み失敗" do
    {
      create: [ :post, nil ],
      update: [ :patch, "subscription-1" ],
      delete: [ :delete, "subscription-1" ]
    }.each do |operation, (method, id)|
      it "#{operation}の上流エラーのステータスと本文を保持する" do
        stub_request(method, id ? "#{endpoint}/#{id}" : endpoint)
          .to_return(status: 503, body: "unavailable")
        arguments = {}
        arguments[:id] = id if id
        arguments[:attributes] = attributes unless operation == :delete

        expect { described_class.public_send(operation, **arguments) }
          .to raise_error(Microcms::FetchContentsService::FetchError) { |error|
            expect(error.status).to eq(503)
            expect(error.body).to eq("unavailable")
          }
      end
    end
  end

  it "明示されたAPIキーとHTTPクライアントを使う" do
    stub_request(:post, endpoint)
      .with(headers: { "X-MICROCMS-API-KEY" => "explicit-key" }, body: attributes.to_json)
      .to_return(status: 201, body: { id: "new" }.to_json)

    expect(described_class.create(attributes:, api_key: "explicit-key", faraday: Faraday.new)).to eq(id: "new")
  end

  [ nil, "" ].each do |key|
    it "APIキーが#{key.inspect}なら送信前に失敗する" do
      allow(Rails.application.credentials).to receive(:dig).with(:microcms, :api_key).and_return(key)

      expect { described_class.create(attributes:) }.to raise_error(/MICROCMS api key is missing/)
    end
  end
end
