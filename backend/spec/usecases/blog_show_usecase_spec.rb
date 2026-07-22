require "rails_helper"

RSpec.describe BlogShowUsecase do
  describe ".call" do
    subject(:result) { described_class.call(article_id: article_id) }

    let(:article_id) { "article-1" }

    before do
      allow(Article).to receive(:find).with(article_id).and_return(
        {
          id: "article-1",
          title: "記事1",
          publishedAt: "2026-02-10T00:00:00.000Z",
          content: "<p>本文</p>",
          author: "著者"
        }
      )
    end

    it do
      expect(result).to eq(
        {
          props: {
            article: {
              id: "article-1",
              title: "記事1",
              publishedDate: "2026/02/10",
              content: "<p>本文</p>",
              tags: nil,
              characterCount: 2,
              readingTimeMinutes: 0.5,
              author: "著者",
              authorId: nil,
              authorImageUrl: nil
            }
          },
          status: :ok
        }
      )
    end

    context "記事が見つからない場合" do
      let(:article_id) { "missing" }

      before do
        allow(Article).to receive(:find).with(article_id).and_return(nil)
      end

      it do
        expect(result).to eq(
          {
            props: {
              article: nil
            },
            status: :not_found
          }
        )
      end
    end
  end
end
