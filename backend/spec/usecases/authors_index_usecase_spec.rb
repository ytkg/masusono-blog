require "rails_helper"

RSpec.describe AuthorsIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    before do
      allow(Author).to receive(:all).and_return(
        [
          {
            id: "9wgrey2lh3",
            name: "増田",
            title: "友達と行事に全力で参加する人",
            bio: "プロフィール本文",
            icon: {
              url: "https://images.microcms-assets.io/assets/masuda.webp"
            }
          },
          {
            id: "",
            name: "未登録",
            title: "IDがない人",
            bio: "表示しないプロフィール"
          }
        ]
      )
    end

    it "microCMSの著者プロフィールをそのまま公開用データとして返す" do
      expect(result).to eq(
        {
          props: {
            authors: [
              {
                id: "9wgrey2lh3",
                name: "増田",
                title: "友達と行事に全力で参加する人",
                bio: "プロフィール本文",
                imageUrl: "https://images.microcms-assets.io/assets/masuda.webp?fit=crop&w=192&h=192"
              }
            ]
          },
          status: :ok
        }
      )
    end
  end
end
