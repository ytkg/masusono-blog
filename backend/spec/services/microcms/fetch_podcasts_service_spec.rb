require "rails_helper"

RSpec.describe Microcms::FetchPodcastsService do
  describe ".execute" do
    subject(:result) { described_class.execute }

    let(:endpoint) { described_class::MICROCMS_PODCASTS_ENDPOINT }
    let(:query) { { "limit" => "100", "offset" => "0", "orders" => "-publishedAt" } }
    let(:contents) do
      [
        {
          id: "i4qq-26pty84",
          createdAt: "2026-02-07T17:04:12.291Z",
          updatedAt: "2026-02-07T17:04:15.788Z",
          publishedAt: "2026-02-07T17:04:12.291Z",
          revisedAt: "2026-02-07T17:04:15.788Z",
          title: "プライベートとか普通とかの話",
          audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3"
        }
      ]
    end

    before do
      stub_microcms_get(endpoint:, query:, contents:)
    end

    it do
      expect(result).to eq(contents)
    end

    it do
      expect(described_class::ENDPOINT).to eq(described_class::MICROCMS_PODCASTS_ENDPOINT)
    end
  end
end
