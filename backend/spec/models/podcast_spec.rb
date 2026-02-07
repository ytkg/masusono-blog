require "rails_helper"

RSpec.describe Podcast do
  describe ".all" do
    subject(:result) { described_class.all }

    let(:podcasts) do
      [
        {
          "id" => "i4qq-26pty84",
          "no" => "001",
          "title" => "テスト回",
          "publishedAt" => "2026-02-07T17:04:12.291Z",
          "audioUrl" => "https://example.com/podcast/001.mp3"
        }
      ]
    end

    before do
      allow(Microcms::FetchPodcastsService).to receive(:execute).and_return(podcasts)
    end

    it do
      expect(result).to eq(
        [
          {
            "id" => "001",
            "title" => "テスト回",
            "publishedAt" => "2026/02/07",
            "audioUrl" => "https://example.com/podcast/001.mp3"
          }
        ]
      )
    end
  end
end
