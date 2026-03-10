require "rails_helper"

RSpec.describe BlogShowUsecase do
  describe ".call" do
    subject(:result) { described_class.call(article_id: article_id) }

    let(:article_id) { "article-1" }

    before do
      allow(BlogIndexUsecase).to receive(:call).and_return(
        {
          props: {
            articles: [
              {
                id: "article-1",
                title: "記事1",
                publishedDate: "2026/02/10",
                content: "<p>本文</p>",
                author: "著者"
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
            article: {
              id: "article-1",
              title: "記事1",
              publishedDate: "2026/02/10",
              content: "<p>本文</p>",
              author: "著者"
            }
          },
          status: :ok
        }
      )
    end

    context "記事が見つからない場合" do
      let(:article_id) { "missing" }

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
