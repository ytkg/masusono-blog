require "rails_helper"

RSpec.describe PodcastsIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:podcasts) do
      [
        {
          id: "i4qq-26pty84",
          title: "テスト回",
          publishedAt: "2026-02-07T17:04:12.291Z",
          audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3"
        },
        {
          id: "i4qq-26pty85",
          title: "クエリ付きURL",
          publishedAt: "2026-02-08T00:00:00.000Z",
          audioUrl: "https://storage.googleapis.com/masusono-podcast/002.mp3?download=1"
        },
        {
          id: "i4qq-26pty86",
          title: "不正URL(別ドメイン)",
          publishedAt: "2026-02-09T00:00:00.000Z",
          audioUrl: "https://example.com/podcast/003.mp3"
        }
      ]
    end

    before do
      allow(Podcast).to receive(:all).and_return(podcasts)
    end

    it do
      expect(result[:podcasts]).to eq(
        [
          {
            id: "001",
            title: "テスト回",
            publishedDate: "2026/02/07",
            audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3"
          },
          {
            id: "002",
            title: "クエリ付きURL",
            publishedDate: "2026/02/08",
            audioUrl: "https://storage.googleapis.com/masusono-podcast/002.mp3?download=1"
          },
          {
            id: "",
            title: "不正URL(別ドメイン)",
            publishedDate: "2026/02/09",
            audioUrl: "https://example.com/podcast/003.mp3"
          }
        ]
      )
    end

    it "キー順は id, title, publishedDate, audioUrl" do
      expect(result[:podcasts].map(&:keys)).to all(eq(%i[id title publishedDate audioUrl]))
    end
  end
end
