require "rails_helper"

RSpec.describe BlogShowUsecase do
  describe ".call" do
    subject(:result) { described_class.call(article_id: article_id) }

    let(:article_id) { "article-1" }

    let(:article) do
      {
        id: "article-1",
        title: "記事1",
        publishedAt: "2026-02-10T00:00:00.000Z",
        content: "<p>本文</p>",
        author: "著者"
      }
    end

    before do
      allow(Article).to receive(:find).with(article_id).and_return(article)
      allow(YearAgoArticlesBuilder).to receive(:call).with(article: article).and_return([])
      allow(RelatedArticlesBuilder).to receive(:call).with(article: article).and_return([])
    end

    it do
      expect(result).to eq(
        {
          props: {
            relatedArticles: [],
            yearAgoArticles: [],
            ogpImagePath: ArticleOgpImage.path(article: article),
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
      let(:article) { nil }

      it do
        expect(result).to eq(
          {
            props: {
              article: nil,
              relatedArticles: [],
              yearAgoArticles: [],
              ogpImagePath: nil
            },
            status: :not_found
          }
        )
      end
    end

    context "1年前の記事がある場合" do
      before do
        allow(YearAgoArticlesBuilder).to receive(:call).with(article: article)
          .and_return([ { id: "past", title: "前年の記事" } ])
      end

      it "本文と別のpropsで返す" do
        expect(result[:props][:yearAgoArticles]).to eq([ { id: "past", title: "前年の記事" } ])
        expect(result[:props][:article][:content]).to eq(article[:content])
      end
    end

    context "1年前の記事の取得が失敗した場合" do
      before do
        allow(YearAgoArticlesBuilder).to receive(:call).and_call_original
        allow(Article).to receive(:fetch_by_filter)
          .and_raise(Microcms::FetchContentsService::FetchError.new(status: 503, body: "unavailable"))
      end

      it "本文の正常表示を維持する" do
        expect(result[:status]).to eq(:ok)
        expect(result[:props][:article][:content]).to eq(article[:content])
        expect(result[:props][:yearAgoArticles]).to eq([])
      end
    end

    context "関連記事を取得する場合" do
      let(:article) { super().merge(tags: "散歩") }

      before do
        allow(RelatedArticlesBuilder).to receive(:call).and_call_original
        allow(Article).to receive(:all).and_return([ { id: "related", title: "散歩の記事", tags: "散歩" } ])
      end

      it "本文を変更せず関連記事を別のpropsで返す" do
        expect(result[:props][:relatedArticles]).to eq([ { id: "related", title: "散歩の記事" } ])
        expect(result[:props][:article][:content]).to eq(article[:content])
      end

      context "関連記事取得が失敗した場合" do
        before do
          allow(Article).to receive(:all).and_raise(Microcms::FetchContentsService::FetchError.new(status: 503, body: "unavailable"))
        end

        it "正常な本文表示を維持する" do
          expect(result[:status]).to eq(:ok)
          expect(result[:props][:article][:content]).to eq(article[:content])
          expect(result[:props][:relatedArticles]).to eq([])
        end
      end
    end
  end
end
