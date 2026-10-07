require "rails_helper"

RSpec.describe Microcms::FetchContentsService do
  describe ".execute" do
    subject(:result) { service_class.execute(filters:, ids:) }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/contents".freeze)
      stub_const("Microcms::TestFetchContentsService", klass)
    end
    let(:endpoint) { service_class::ENDPOINT }
    let(:logger) { instance_double(Logger, info: nil, warn: nil, error: nil) }
    let(:filters) { nil }
    let(:ids) { nil }
    let(:first_page_query) do
      { "limit" => "100", "offset" => "0", "orders" => "-publishedAt" }.tap do |query|
        query["filters"] = filters if filters
        query["ids"] = ids if ids
      end
    end
    let(:first_page_status) { 200 }
    let(:first_page_response_headers) { json_response_headers }
    let(:first_page_contents) do
      [
        { "id" => "first" }
      ]
    end
    let(:first_page_total_count) { 1 }
    let(:first_page_limit) { 100 }
    let(:first_page_offset) { 0 }
    let(:first_page_body) do
      microcms_response_body(
        contents: first_page_contents,
        total_count: first_page_total_count,
        limit: first_page_limit,
        offset: first_page_offset
      )
    end
    let(:second_page_query) { nil }
    let(:second_page_status) { 200 }
    let(:second_page_response_headers) { json_response_headers }
    let(:second_page_contents) { [] }
    let(:second_page_offset) { first_page_limit }
    let(:second_page_body) do
      microcms_response_body(
        contents: second_page_contents,
        total_count: first_page_total_count,
        limit: first_page_limit,
        offset: second_page_offset
      )
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
      stub_microcms_api_key
      allow(Rails).to receive(:logger).and_return(logger)
      stub_request(:get, endpoint)
        .with(query: first_page_query, headers: microcms_request_headers)
        .to_return(
          status: first_page_status,
          body: first_page_body,
          headers: first_page_response_headers
        )
      next unless second_page_query

      stub_request(:get, endpoint)
        .with(query: second_page_query, headers: microcms_request_headers)
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

    context "フィルタを指定する場合" do
      let(:filters) { "author[equals]author-1" }

      it do
        expect(result).to eq([ { id: "first" } ])
      end
    end

    context "コンテンツIDを指定する場合" do
      let(:ids) { "content-1" }

      it do
        expect(result).to eq([ { id: "first" } ])
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
        expect(logger).to have_received(:warn).with(include("error_type=invalid_pagination_meta"))
        expect(a_request(:get, endpoint).with(query: first_page_query, headers: microcms_request_headers)).to have_been_made.once
      end
    end

    context "取得ページ数が上限に達した場合" do
      let(:first_page_total_count) { 101 }

      before do
        ENV["MICROCMS_MAX_PAGES"] = "1"
      end

      it do
        expect(result.map { |content| content[:id] }).to eq(%w[first])
        expect(logger).to have_received(:warn).with(include("error_type=max_pages_reached"))
        expect(a_request(:get, endpoint).with(query: first_page_query, headers: microcms_request_headers)).to have_been_made.once
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
        expect(logger).to have_received(:warn).with(include("error_type=max_total_count_reached"))
      end
    end

    context "初回取得が失敗する場合" do
      let(:body) { '{"message":"server error"}' }
      let(:first_page_status) { 500 }
      let(:first_page_body) { body }

      it do
        expect { result }.to raise_error(
          described_class::FetchError,
          "microCMS request failed: status=500"
        )
        expect(logger).to have_received(:error).with(
          include("microcms_request_failed", "upstream_status=500")
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
          "microCMS request failed: status=503"
        )
        expect(logger).to have_received(:error).with(
          include("microcms_request_failed", "upstream_status=503")
        )
      end
    end
  end

  describe "#parse_contents" do
    subject(:result) { described_class.new(api_key: "test-key").parse_contents(body) }

    let(:body) do
      { contents: [ { id: "article", author: { name: "増田" }, tags: [ { name: "Ruby" } ], enabled: true, missing: nil } ] }.to_json
    end

    it "配列と入れ子のキーをシンボルにし、値を維持する" do
      expect(result).to eq([ { id: "article", author: { name: "増田" }, tags: [ { name: "Ruby" } ], enabled: true, missing: nil } ])
    end

    context "不正なJSONの場合" do
      let(:body) { "invalid" }

      it "既存の解析エラーを維持する" do
        expect { result }.to raise_error(JSON::ParserError)
      end
    end
  end
end
