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
    let(:query) { { "limit" => "100", "offset" => "0", "orders" => "-publishedAt" } }
    let(:contents) do
      [
        {
          "id" => "first",
          "publishedAt" => "2025-10-05T00:00:00.000Z",
          "title" => "first title",
          "content" => "<p>first body</p>",
          "author" => { "name" => "増田太郎" }
        }
      ]
    end
    let(:body) do
      {
        contents:,
        totalCount: contents.size,
        limit: 100,
        offset: 0
      }.to_json
    end

    before do
      allow(Rails.application.credentials).to receive(:dig).with(:microcms, :api_key).and_return("test-api-key")
      stub_request(:get, endpoint)
        .with(query:, headers: request_headers)
        .to_return(status: 200, body:, headers: { "Content-Type" => "application/json" })
    end

    it do
      expect(result).to eq(contents)
    end

    it do
      expect(described_class::ENDPOINT).to eq(described_class::MICROCMS_ARTICLES_ENDPOINT)
    end
  end
end
