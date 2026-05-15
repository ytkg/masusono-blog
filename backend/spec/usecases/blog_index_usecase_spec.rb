require "rails_helper"

RSpec.describe BlogIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:articles) do
      [
        {
          id: "first",
          publishedAt: "2025-10-05T18:30:00.000Z",
          title: "first title",
          content: "<p>first body</p>",
          author: {
            id: "9wgrey2lh3",
            name: "増田太郎",
            icon: {
              url: "https://images.microcms-assets.io/assets/masuda.webp"
            }
          }
        },
        {
          id: "second",
          publishedAt: "2025-10-06T00:00:00.000Z",
          title: "second title",
          content: "<p>second body</p>",
          author: nil
        }
      ]
    end

    before do
      allow(Article).to receive(:all).and_return(articles)
    end

    it do
      expect(result[:status]).to eq(:ok)
      expect(result[:props]).to eq(
        {
          articles: [
            {
              id: "first",
              title: "first title",
              publishedDate: "2025/10/06",
              content: "<p>first body</p>",
              author: "増田太郎",
              authorId: "9wgrey2lh3",
              authorImageUrl: "https://images.microcms-assets.io/assets/masuda.webp"
            },
            {
              id: "second",
              title: "second title",
              publishedDate: "2025/10/06",
              content: "<p>second body</p>",
              author: nil,
              authorId: nil,
              authorImageUrl: nil
            }
          ]
        }
      )
    end

    it "キー順は id, title, publishedDate, content, author, authorId, authorImageUrl" do
      expect(result.dig(:props, :articles).map(&:keys)).to all(
        eq(%i[id title publishedDate content author authorId authorImageUrl])
      )
    end
  end
end
