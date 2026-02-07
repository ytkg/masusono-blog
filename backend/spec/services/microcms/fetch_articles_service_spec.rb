require "rails_helper"

RSpec.describe Microcms::FetchArticlesService do
  describe ".execute" do
    subject(:result) { described_class.execute }

    let(:endpoint) { described_class::MICROCMS_ARTICLES_ENDPOINT }
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
            "id" => "first",
            "publishedAt" => "2025-10-05T00:00:00.000Z",
            "title" => "first title",
            "content" => "<p>first body</p>",
            "author" => { "name" => "増田太郎" }
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
              "id" => "first",
              "publishedAt" => "2025-10-05T00:00:00.000Z",
              "title" => "first title",
              "content" => "<p>first body</p>",
              "author" => { "name" => "増田太郎" }
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
              "id" => "second",
              "publishedAt" => "2025-10-06T00:00:00.000Z",
              "title" => "second title",
              "content" => "<p>second body</p>",
              "author" => { "name" => "増田次郎" }
            }
          ],
          totalCount: 101,
          limit: 100,
          offset: 100
        }.to_json
      end

      it do
        expect(result.map { |article| article["id"] }).to eq(%w[first second])
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
