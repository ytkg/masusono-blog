require "rails_helper"

RSpec.describe "WebBlog", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /blog" do
    let(:articles) do
      [
        {
          id: "article-1",
          title: "記事1",
          publishedDate: "2026/02/10",
          content: "<p>本文1</p>",
          author: "著者1"
        }
      ]
    end

    before do
      allow(BlogIndexUsecase).to receive(:call).and_return(
        { props: { articles: articles }, status: :ok }
      )
    end

    it "Inertiaページを返す" do
      get "/blog", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("data-page=")
      expect(response.body).to include("&quot;component&quot;:&quot;blog/index&quot;")
      expect(response.body).to include("記事1")
    end
  end

  describe "GET /blog/:article_id" do
    let(:article) do
      {
        id: "article-1",
        title: "記事1",
        publishedDate: "2026/02/10",
        content: "<p>本文1</p>",
        author: "著者1"
      }
    end

    it "存在する場合は詳細Inertiaページを返す" do
      allow(BlogShowUsecase).to receive(:call).with(article_id: "article-1").and_return(
        { props: { article: article }, status: :ok }
      )

      get "/blog/article-1", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;blog/show&quot;")
      expect(response.body).to include("記事1")
    end

    it "存在しない場合は404のInertiaページを返す" do
      allow(BlogShowUsecase).to receive(:call).with(article_id: "missing").and_return(
        { props: { article: nil }, status: :not_found }
      )

      get "/blog/missing", headers: html_headers

      expect(response).to have_http_status(:not_found)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;blog/show&quot;")
    end
  end
end
