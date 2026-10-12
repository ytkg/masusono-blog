require "rails_helper"

RSpec.describe ArticlePayloadBuilder do
  describe ".call" do
    subject(:result) { described_class.call(article:) }

    let(:article) do
      {
        id: "article-1",
        title: "記事タイトル",
        publishedAt: "2026-07-31T00:30:00Z",
        content: "あ" * 401,
        tags: "Ruby, Rails",
        author: {
          id: "author-1",
          name: "増田",
          icon: { url: "https://images.microcms-assets.io/assets/masuda.webp" }
        }
      }
    end

    it do
      expect(result).to eq(
        {
          id: "article-1",
          title: "記事タイトル",
          publishedDate: "2026/07/31",
          content: "あ" * 401,
          tags: "Ruby, Rails",
          characterCount: 401,
          readingTimeMinutes: 1.5,
          author: "増田",
          authorId: "author-1",
          authorImageUrl: "https://images.microcms-assets.io/assets/masuda.webp?fit=crop&w=192&h=192"
        }
      )
    end

    context "本文と著者情報がない場合" do
      let(:article) { { id: "article-2", title: "下書き", content: nil, author: nil } }

      it do
        expect(result).to include(
          characterCount: 0,
          readingTimeMinutes: 0,
          author: nil,
          authorId: nil,
          authorImageUrl: nil
        )
      end
    end
  end
end
