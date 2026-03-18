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
end
