require "rails_helper"

RSpec.describe PodcastIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    before do
      allow(Api::Podcast::EpisodesIndexUsecase).to receive(:call).and_return(
        {
          episodes: [
            {
              id: "001",
              title: "テスト回",
              publishedDate: "2026/02/10",
              audioUrl: "https://example.com/001.mp3"
            }
          ]
        }
      )
    end

    it do
      expect(result).to eq(
        {
          episodes: [
            {
              id: "001",
              title: "テスト回",
              publishedDate: "2026/02/10",
              audioUrl: "https://example.com/001.mp3"
            }
          ]
        }
      )
    end
  end
end
