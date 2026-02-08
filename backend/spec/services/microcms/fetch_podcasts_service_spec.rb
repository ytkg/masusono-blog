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
    let(:query) { { "limit" => "100", "offset" => "0", "orders" => "-publishedAt" } }
    let(:contents) do
      [
        {
          "id" => "i4qq-26pty84",
          "createdAt" => "2026-02-07T17:04:12.291Z",
          "updatedAt" => "2026-02-07T17:04:15.788Z",
          "publishedAt" => "2026-02-07T17:04:12.291Z",
          "revisedAt" => "2026-02-07T17:04:15.788Z",
          "title" => "プライベートとか普通とかの話",
          "audioUrl" => "https://storage.googleapis.com/masusono-podcast/001.mp3"
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
      expect(described_class::ENDPOINT).to eq(described_class::MICROCMS_PODCASTS_ENDPOINT)
    end
  end
end
