require "rails_helper"

RSpec.describe Microcms::FetchPodcastsService do
  describe ".execute" do
    subject(:result) { described_class.execute }

    let(:endpoint) { described_class::MICROCMS_PODCASTS_ENDPOINT }
    let(:request_headers) do
      {
        "Accept" => "application/json",
        "X-API-KEY" => "test-api-key"
      }
    end
    let(:first_page_query) { { "limit" => "100", "offset" => "0", "orders" => "-publishedAt" } }
    let(:first_page_status) { 200 }
    let(:first_page_response_headers) { { "Content-Type" => "application/json" } }
    let(:first_page_body) do
      {
        contents: [
          {
            "id" => "i4qq-26pty84",
            "createdAt" => "2026-02-07T17:04:12.291Z",
            "updatedAt" => "2026-02-07T17:04:15.788Z",
            "publishedAt" => "2026-02-07T17:04:12.291Z",
            "revisedAt" => "2026-02-07T17:04:15.788Z",
            "title" => "プライベートとか普通とかの話",
            "audioUrl" => "https://storage.googleapis.com/masusono-podcast/001.mp3"
          }
        ],
        totalCount: first_page_total_count,
        limit: 100,
        offset: 0
      }.to_json
    end
    let(:first_page_total_count) { 1 }
    let(:second_page_query) { nil }
    let(:second_page_status) { 200 }
    let(:second_page_response_headers) { { "Content-Type" => "application/json" } }
    let(:second_page_body) { { contents: [] }.to_json }

    before do
      allow(Rails.application.credentials).to receive(:dig).with(:microcms, :api_key).and_return("test-api-key")
      stub_request(:get, endpoint)
        .with(query: first_page_query, headers: request_headers)
        .to_return(
          status: first_page_status,
          body: first_page_body,
          headers: first_page_response_headers
        )
      next unless second_page_query

      stub_request(:get, endpoint)
        .with(query: second_page_query, headers: request_headers)
        .to_return(
          status: second_page_status,
          body: second_page_body,
          headers: second_page_response_headers
        )
    end

    context "1ページで完結する場合" do
      it do
        expect(result).to eq(
          [
            {
              "id" => "i4qq-26pty84",
              "createdAt" => "2026-02-07T17:04:12.291Z",
              "updatedAt" => "2026-02-07T17:04:15.788Z",
              "title" => "プライベートとか普通とかの話",
              "publishedAt" => "2026-02-07T17:04:12.291Z",
              "revisedAt" => "2026-02-07T17:04:15.788Z",
              "audioUrl" => "https://storage.googleapis.com/masusono-podcast/001.mp3"
            }
          ]
        )
      end
    end

    context "複数ページを取得する場合" do
      let(:first_page_total_count) { 101 }
      let(:second_page_query) { { "limit" => "100", "offset" => "100", "orders" => "-publishedAt" } }
      let(:second_page_body) do
        {
          contents: [
            {
              "id" => "x2qq-26pty99",
              "publishedAt" => "2026-02-08T17:04:12.291Z",
              "title" => "二本目",
              "audioUrl" => "https://storage.googleapis.com/masusono-podcast/002.mp3"
            }
          ],
          totalCount: 101,
          limit: 100,
          offset: 100
        }.to_json
      end

      it do
        expect(result.map { |podcast| podcast["id"] }).to eq(%w[i4qq-26pty84 x2qq-26pty99])
      end
    end

    context "初回取得が失敗する場合" do
      let(:body) { '{"message":"server error"}' }
      let(:first_page_status) { 500 }
      let(:first_page_body) { body }

      it do
        expect { result }.to raise_error(
          described_class::FetchError,
          "microCMS request failed: status=500, body=#{body}"
        )
      end
    end

    context "追加ページ取得が失敗する場合" do
      let(:body) { "upstream timeout" }
      let(:first_page_total_count) { 101 }
      let(:second_page_query) { { "limit" => "100", "offset" => "100", "orders" => "-publishedAt" } }
      let(:second_page_status) { 503 }
      let(:second_page_body) { body }

      it do
        expect { result }.to raise_error(
          described_class::FetchError,
          "microCMS request failed: status=503, body=#{body}"
        )
      end
    end
  end
end
