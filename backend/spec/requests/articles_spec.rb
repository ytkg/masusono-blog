require "rails_helper"

RSpec.describe "Articles", type: :request do
  describe "GET /articles" do
    let(:articles) do
      Array.new(120) do |index|
        number = index + 1
        {
          id: "post-#{number}",
          publishedDate: "2025/10/05",
          title: "記事#{number}",
          content: "<p>本文#{number}</p>",
          author: "著者#{number}"
        }
      end
    end

    before do
      allow(ArticlesIndexUsecase).to receive(:call).and_return({ articles: articles })
    end

    it_behaves_like "array json contract",
                    path: "/articles",
                    expected_keys: %w[id title publishedDate content author]

    it do
      get "/articles"

      payload = JSON.parse(response.body)
      expect(payload.size).to eq(120)
      first = payload.first
      expect(first["id"]).to eq("post-1")
      expect(first["title"]).to eq("記事1")
      expect(first["publishedDate"]).to eq("2025/10/05")
      expect(first["content"]).to eq("<p>本文1</p>")
      expect(first["author"]).to eq("著者1")
    end
  end
end
