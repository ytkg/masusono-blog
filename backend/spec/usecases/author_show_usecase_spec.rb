require "rails_helper"

RSpec.describe AuthorShowUsecase do
  describe ".call" do
    subject(:result) { described_class.call(author_id: author_id) }

    let(:author_id) { "9wgrey2lh3" }

    before do
      allow(Author).to receive(:find).with(author_id).and_return(
        {
          id: author_id,
          name: "増田",
          title: "友達と行事に全力で参加する人",
          bio: "プロフィール本文",
          icon: { url: "https://images.microcms-assets.io/assets/masuda.webp" }
        }
      )
      allow(Article).to receive(:for_author).with(author_id).and_return(
        [
          {
            id: "article-1",
            title: "記事1",
            publishedAt: "2026-02-10T00:00:00.000Z",
            content: "<p>本文</p>",
            author: { id: author_id, name: "増田" }
          }
        ]
      )
    end

    it "著者プロフィールと著者の記事だけを返す" do
      expect(result.dig(:props, :author, :id)).to eq("9wgrey2lh3")
      expect(result.dig(:props, :author, :name)).to eq("増田")
      expect(result.dig(:props, :author, :bio)).to eq("プロフィール本文")
      expect(result.dig(:props, :author, :imageUrl)).to eq("https://images.microcms-assets.io/assets/masuda.webp?fit=crop&w=192&h=192")
      expect(result.dig(:props, :articles).map { |article| article[:id] }).to eq([ "article-1" ])
      expect(result[:status]).to eq(:ok)
    end

    context "著者が見つからない場合" do
      let(:author_id) { "missing" }

      before do
        allow(Author).to receive(:find).with(author_id).and_return(nil)
      end

      it do
        expect(result).to eq(
          {
            props: {
              author: nil,
              articles: []
            },
            status: :not_found
          }
        )
      end
    end
  end
end
