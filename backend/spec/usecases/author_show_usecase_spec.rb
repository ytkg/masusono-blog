require "rails_helper"

RSpec.describe AuthorShowUsecase do
  describe ".call" do
    subject(:result) { described_class.call(author_id: author_id) }

    let(:author_id) { "9wgrey2lh3" }

    before do
      allow(AuthorsIndexUsecase).to receive(:call).and_return(
        {
          props: {
            authors: [
              {
                id: "9wgrey2lh3",
                name: "増田",
                title: "友達と行事に全力で参加する人",
                bio: "プロフィール本文",
                imageUrl: "https://images.microcms-assets.io/assets/masuda.webp"
              }
            ]
          },
          status: :ok
        }
      )
      allow(BlogIndexUsecase).to receive(:call).and_return(
        {
          props: {
            articles: [
              {
                id: "article-1",
                title: "記事1",
                publishedDate: "2026/02/10",
                content: "<p>本文</p>",
                author: "増田",
                authorId: "9wgrey2lh3"
              },
              {
                id: "article-same-name-without-id",
                title: "著者IDがない同名記事",
                publishedDate: "2026/02/10",
                content: "<p>本文</p>",
                author: "増田",
                authorId: nil
              },
              {
                id: "article-2",
                title: "記事2",
                publishedDate: "2026/02/11",
                content: "<p>本文</p>",
                author: "その他1",
                authorId: "kejk_o44e1"
              }
            ]
          },
          status: :ok
        }
      )
    end

    it "著者プロフィールと著者の記事だけを返す" do
      expect(result.dig(:props, :author, :id)).to eq("9wgrey2lh3")
      expect(result.dig(:props, :author, :name)).to eq("増田")
      expect(result.dig(:props, :author, :bio)).to eq("プロフィール本文")
      expect(result.dig(:props, :author, :imageUrl)).to eq("https://images.microcms-assets.io/assets/masuda.webp")
      expect(result.dig(:props, :articles).map { |article| article[:id] }).to eq([ "article-1" ])
      expect(result[:status]).to eq(:ok)
    end

    context "著者が見つからない場合" do
      let(:author_id) { "missing" }

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
