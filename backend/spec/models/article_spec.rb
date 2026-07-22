require "rails_helper"

RSpec.describe Article do
  describe ".all" do
    subject(:result) { described_class.all }

    let(:articles) do
      [
        {
          id: "first",
          publishedAt: "2025-10-05T00:00:00.000Z",
          title: "first title",
          content: <<~HTML.squish,
            <p>first body</p>
            <img src="https://images.microcms-assets.io/assets/article.webp?foo=bar&w=1600&fit=crop">
            <img src="https://example.com/assets/article.webp">
          HTML
          author: {
            name: "増田太郎",
            icon: {
              url: "https://images.microcms-assets.io/assets/author.webp"
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
      allow(Microcms::FetchArticlesService).to receive(:execute).and_return(articles)
    end

    it "記事本文内のmicroCMS画像URLだけ省データ向けのクエリを付与する" do
      first_article = result.first

      expect(first_article[:content]).to include(
        'src="https://images.microcms-assets.io/assets/article.webp?foo=bar&amp;fit=max&amp;w=800&amp;h=800"'
      )
      expect(first_article[:content]).to include(
        'src="https://example.com/assets/article.webp"'
      )
      expect(first_article.dig(:author, :icon, :url)).to eq(
        "https://images.microcms-assets.io/assets/author.webp"
      )
      expect(result.second).to eq(articles.second)
    end

    it "取得した記事ハッシュは破壊的に変更しない" do
      result

      expect(articles.first[:content]).to include("w=1600")
      expect(articles.first[:content]).to include("fit=crop")
    end
  end

  describe ".find" do
    subject(:result) { described_class.find(article_id) }

    let(:article_id) { "article-1" }

    before do
      allow(Microcms::FetchArticlesService).to receive(:execute)
        .with(ids: "article-1")
        .and_return([ { id: article_id, content: "<p>本文</p>" } ])
    end

    it do
      expect(result).to eq({ id: article_id, content: "<p>本文</p>" })
    end

    context "IDが空の場合" do
      let(:article_id) { "" }

      it do
        expect(result).to be_nil
      end
    end
  end

  describe ".for_author" do
    subject(:result) { described_class.for_author(author_id) }

    let(:author_id) { "author-1" }

    before do
      allow(Microcms::FetchArticlesService).to receive(:execute)
        .with(filters: "author[equals]author-1")
        .and_return([ { id: "article-1", content: "<p>本文</p>" } ])
    end

    it do
      expect(result).to eq([ { id: "article-1", content: "<p>本文</p>" } ])
    end

    context "著者IDが空の場合" do
      let(:author_id) { "" }

      it do
        expect(result).to eq([])
      end
    end
  end
end
