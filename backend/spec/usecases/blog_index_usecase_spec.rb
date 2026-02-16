require "rails_helper"

RSpec.describe BlogIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    before do
      allow(Api::Blog::ArticlesIndexUsecase).to receive(:call).and_return(
        {
          articles: [
            {
              id: "article-1",
              title: "記事1",
              publishedDate: "2026/02/10",
              content: "<p>本文</p>",
              author: "著者"
            }
          ]
        }
      )
    end

    it do
      expect(result).to eq(
        {
          articles: [
            {
              id: "article-1",
              title: "記事1",
              publishedDate: "2026/02/10",
              content: "<p>本文</p>",
              author: "著者"
            }
          ]
        }
      )
    end
  end
end
