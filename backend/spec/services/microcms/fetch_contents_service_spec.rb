require "rails_helper"

RSpec.describe Microcms::FetchContentsService do
  describe ".execute" do
    subject(:result) { service_class.execute }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/contents".freeze)
      stub_const("Microcms::TestFetchContentsService", klass)
    end
    let(:endpoint) { service_class::ENDPOINT }
    let(:logger) { instance_double(Logger, warn: nil) }
    let(:request_headers) do
      {
        "Accept" => "application/json",
        "X-API-KEY" => "test-api-key"
      }
    end
    let(:first_page_query) { { "limit" => "100", "offset" => "0", "orders" => "-publishedAt" } }
    let(:first_page_status) { 200 }
    let(:first_page_response_headers) { { "Content-Type" => "application/json" } }
    let(:first_page_contents) do
      [
        { "id" => "first" }
      ]
    end
    let(:first_page_total_count) { 1 }
    let(:first_page_limit) { 100 }
    let(:first_page_offset) { 0 }
    let(:first_page_body) do
      {
        contents: first_page_contents,
        totalCount: first_page_total_count,
        limit: first_page_limit,
        offset: first_page_offset
      }.to_json
    end
    let(:second_page_query) { nil }
    let(:second_page_status) { 200 }
    let(:second_page_response_headers) { { "Content-Type" => "application/json" } }
    let(:second_page_contents) { [] }
    let(:second_page_offset) { first_page_limit }
    let(:second_page_body) do
      {
        contents: second_page_contents,
        totalCount: first_page_total_count,
        limit: first_page_limit,
        offset: second_page_offset
      }.to_json
    end

    around do |example|
      original_max_pages = ENV["MICROCMS_MAX_PAGES"]
      original_max_total_count = ENV["MICROCMS_MAX_TOTAL_COUNT"]
      ENV.delete("MICROCMS_MAX_PAGES")
      ENV.delete("MICROCMS_MAX_TOTAL_COUNT")
      example.run
    ensure
      ENV["MICROCMS_MAX_PAGES"] = original_max_pages
      ENV["MICROCMS_MAX_TOTAL_COUNT"] = original_max_total_count
    end

    before do
      allow(Rails.application.credentials).to receive(:dig).with(:microcms, :api_key).and_return("test-api-key")
      allow(Rails).to receive(:logger).and_return(logger)
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
            { id: "first" }
          ]
        )
      end
    end

    context "複数ページを取得する場合" do
      let(:first_page_total_count) { 101 }
      let(:second_page_query) { { "limit" => "100", "offset" => "100", "orders" => "-publishedAt" } }
      let(:second_page_offset) { 100 }
      let(:second_page_contents) do
        [
          { "id" => "second" }
        ]
      end

      it do
        expect(result.map { |content| content[:id] }).to eq(%w[first second])
      end
    end

    context "ページングメタのlimitが不正値の場合" do
      let(:first_page_total_count) { 200 }
      let(:first_page_limit) { 0 }

      it do
        expect(result.map { |content| content[:id] }).to eq(%w[first])
        expect(logger).to have_received(:warn).with(include("invalid pagination meta"))
        expect(a_request(:get, endpoint).with(query: first_page_query, headers: request_headers)).to have_been_made.once
      end
    end

    context "取得ページ数が上限に達した場合" do
      let(:first_page_total_count) { 101 }

      before do
        ENV["MICROCMS_MAX_PAGES"] = "1"
      end

      it do
        expect(result.map { |content| content[:id] }).to eq(%w[first])
        expect(logger).to have_received(:warn).with(include("max pages reached"))
        expect(a_request(:get, endpoint).with(query: first_page_query, headers: request_headers)).to have_been_made.once
      end
    end

    context "取得件数が上限に達した場合" do
      let(:first_page_total_count) { 10 }
      let(:first_page_limit) { 2 }
      let(:first_page_contents) do
        [
          { "id" => "first" },
          { "id" => "second" }
        ]
      end
      let(:second_page_query) { { "limit" => "2", "offset" => "2", "orders" => "-publishedAt" } }
      let(:second_page_offset) { 2 }
      let(:second_page_contents) do
        [
          { "id" => "third" },
          { "id" => "fourth" }
        ]
      end

      before do
        ENV["MICROCMS_MAX_TOTAL_COUNT"] = "3"
      end

      it do
        expect(result.map { |content| content[:id] }).to eq(%w[first second third])
        expect(logger).to have_received(:warn).with(include("max total count reached"))
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
