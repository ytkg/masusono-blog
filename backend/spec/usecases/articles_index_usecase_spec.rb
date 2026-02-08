require "rails_helper"

RSpec.describe ArticlesIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:articles) do
      [
        {
          id: "first",
          publishedAt: "2025-10-05T00:00:00.000Z",
          title: "first title",
          content: "<p>first body</p>",
          author: { name: "増田太郎" }
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
      expect(result.articles).to eq(
        [
          {
            id: "first",
            title: "first title",
            publishedDate: "2025/10/05",
            content: "<p>first body</p>",
            author: "増田太郎"
          },
          {
            id: "second",
            title: "second title",
            publishedDate: "2025/10/06",
            content: "<p>second body</p>",
            author: nil
          }
        ]
      )
    end

    it "キー順は id, title, publishedDate, content, author" do
      expect(result.articles.map(&:keys)).to all(eq(%i[id title publishedDate content author]))
    end
  end
end
