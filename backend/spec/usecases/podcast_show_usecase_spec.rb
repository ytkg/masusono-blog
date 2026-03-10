require "rails_helper"

RSpec.describe PodcastShowUsecase do
  describe ".call" do
    subject(:result) { described_class.call(episode_id: episode_id) }

    let(:episode_id) { "001" }

    before do
      allow(PodcastIndexUsecase).to receive(:call).and_return(
        {
          props: {
            episodes: [
              {
                id: "001",
                title: "テスト回",
                publishedDate: "2026/02/10",
                audioUrl: "https://example.com/001.mp3"
              }
            ]
          },
          status: :ok
        }
      )
    end

    it do
      expect(result).to eq(
        {
          props: {
            episode: {
              id: "001",
              title: "テスト回",
              publishedDate: "2026/02/10",
              audioUrl: "https://example.com/001.mp3"
            }
          },
          status: :ok
        }
      )
    end

    context "エピソードが見つからない場合" do
      let(:episode_id) { "missing" }

      it do
        expect(result).to eq(
          {
            props: {
              episode: nil
            },
            status: :not_found
          }
        )
      end
    end
  end
end
