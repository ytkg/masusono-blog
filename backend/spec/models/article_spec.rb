require "rails_helper"

RSpec.describe Article do
  describe ".all" do
    subject(:result) { described_class.all }

    let(:articles) do
      [
        {
          "id" => "first",
          "publishedAt" => "2025-10-05T00:00:00.000Z",
          "title" => "first title",
          "content" => "<p>first body</p>",
          "author" => { "name" => "増田太郎" }
        },
        {
          "id" => "second",
          "publishedAt" => "2025-10-06T00:00:00.000Z",
          "title" => "second title",
          "content" => "<p>second body</p>",
          "author" => nil
        }
      ]
    end

    before do
      allow(Microcms::FetchArticlesService).to receive(:execute).and_return(articles)
    end

    it do
      expect(result).to eq(
        [
          {
            id: "first",
            publishedAt: "2025/10/05",
            title: "first title",
            content: "<p>first body</p>",
            author: "増田太郎"
          },
          {
            id: "second",
            publishedAt: "2025/10/06",
            title: "second title",
            content: "<p>second body</p>",
            author: nil
          }
        ]
      )
    end
  end
end
