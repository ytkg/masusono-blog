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

    it do
      get "/articles"

      expect(response).to have_http_status(:ok)
      payload = JSON.parse(response.body)
      expect(payload.size).to eq(120)
      expect(payload).to all(include("id", "publishedDate", "title", "content", "author"))
    end
  end
end
