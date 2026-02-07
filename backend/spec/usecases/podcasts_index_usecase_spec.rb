require "rails_helper"

RSpec.describe PodcastsIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:podcasts) do
      [
        {
          "id" => "001",
          "title" => "テスト回",
          "publishedDate" => "2026/02/07",
          "audioUrl" => "https://example.com/podcast/001.mp3"
        }
      ]
    end

    before do
      allow(Podcast).to receive(:all).and_return(podcasts)
    end

    it do
      expect(result).to eq({ podcasts: podcasts })
    end
  end
end
