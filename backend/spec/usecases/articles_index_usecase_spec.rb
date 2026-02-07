require "rails_helper"

RSpec.describe ArticlesIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    let(:articles) do
      [
        {
          "id" => "first",
          "publishedDate" => "2025/10/05",
          "title" => "first title",
          "content" => "<p>first body</p>",
          "author" => "増田太郎"
        },
        {
          "id" => "second",
          "publishedDate" => "2025/10/06",
          "title" => "second title",
          "content" => "<p>second body</p>",
          "author" => "増田次郎"
        }
      ]
    end

    before do
      allow(Article).to receive(:all).and_return(articles)
    end

    it do
      expect(result).to eq({ articles: articles })
    end
  end
end
