require "rails_helper"

RSpec.describe Microcms::MasudaRun::FetchRankingsService do
  describe ".execute" do
    subject(:result) { service_class.execute(limit: limit) }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/masudarunkings".freeze)
      stub_const("Microcms::MasudaRun::TestFetchRankingsService", klass)
    end
    let(:endpoint) { service_class::ENDPOINT }
    let(:limit) { 10 }

    before do
      stub_microcms_api_key
      stub_request(:get, endpoint)
        .with(
          query: {
            "limit" => limit.to_s,
            "offset" => "0",
            "orders" => "-score,-createdAt"
          },
          headers: microcms_request_headers
        )
        .to_return(
          status: 200,
          body: {
            contents: [
              {
                id: "ranking-1",
                user_id: "alice",
                score: 3000,
                createdAt: "2026-03-01T12:00:00.000Z"
              }
            ],
            totalCount: 25,
            limit: limit,
            offset: 0
          }.to_json,
          headers: json_response_headers
        )
    end

    it "指定件数だけを1ページ目から取得する" do
      expect(result).to eq(
        [
          {
            id: "ranking-1",
            user_id: "alice",
            score: 3000,
            createdAt: "2026-03-01T12:00:00.000Z"
          }
        ]
      )
    end
  end

  describe ".fetch_total_count" do
    subject(:result) { service_class.fetch_total_count }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/masudarunkings".freeze)
      stub_const("Microcms::MasudaRun::TestFetchRankingsServiceForTotalCount", klass)
    end
    let(:endpoint) { service_class::ENDPOINT }

    before do
      stub_microcms_api_key
      stub_request(:get, endpoint)
        .with(
          query: {
            "limit" => "1",
            "offset" => "0",
            "orders" => "-score,-createdAt"
          },
          headers: microcms_request_headers
        )
        .to_return(
          status: 200,
          body: {
            contents: [
              {
                id: "ranking-1",
                user_id: "alice",
                score: 3000,
                createdAt: "2026-03-01T12:00:00.000Z"
              }
            ],
            totalCount: 25,
            limit: 1,
            offset: 0
          }.to_json,
          headers: json_response_headers
        )
    end

    it do
      expect(result).to eq(25)
    end
  end
  [ nil, 0, -1, "invalid" ].each do |limit|
    it "limit #{limit.inspect}は既存の全件取得へ戻す" do
      response = double(success?: true, body: { contents: [ { id: "ranking" } ] }.to_json)
      expect(described_class.execute(api_key: "test-key", limit:, response:)).to eq([ { id: "ranking" } ])
    end
  end

  [ nil, -1, "25" ].each do |total_count|
    it "不正な総件数#{total_count.inspect}を0件と偽らず不明として返す" do
      response = double(success?: true, body: { contents: [], totalCount: total_count }.to_json)
      expect(described_class.fetch_total_count(api_key: "test-key", response:)).to be_nil
    end
  end

  it "総件数0は不明値と区別して返す" do
    response = double(success?: true, body: { contents: [], totalCount: 0 }.to_json)
    expect(described_class.fetch_total_count(api_key: "test-key", response:)).to eq(0)
  end

  [ "{", "[]", "null", "true", "123", '"private-body"' ].each do |body|
    it "解析できない総件数の本文#{body.inspect}を不明値として返す" do
      response = double(success?: true, body: body)
      expect(described_class.fetch_total_count(api_key: "test-key", response:)).to be_nil
    end
  end

  it "総件数照会のHTTPエラーを不正JSONより優先する" do
    response = double(success?: false, status: 429, body: "{")
    expect { described_class.fetch_total_count(api_key: "test-key", response:) }.to raise_error(Microcms::FetchContentsService::FetchError) { |error|
      expect(error.status).to eq(429)
    }
  end

  it "総件数照会の本文がnilでも不明値にする" do
    response = double(success?: true, body: nil)
    expect(described_class.fetch_total_count(api_key: "test-key", response:)).to be_nil
  end
end
