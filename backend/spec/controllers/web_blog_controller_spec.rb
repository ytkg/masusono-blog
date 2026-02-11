require "rails_helper"

RSpec.describe BlogController, type: :controller do
  render_views

  describe "WebBlogController GET #index" do
    it "Blog の Inertia ページを返す" do
      allow(ArticlesIndexUsecase).to receive(:call).and_return(
        {
          articles: [
            {
              id: "article-1",
              title: "記事1",
              publishedDate: "2026/02/10",
              content: "<p>本文1</p>",
              author: "著者1"
            }
          ]
        }
      )

      get :index

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;Blog&quot;")
      expect(response.body).to include("記事1")
    end
  end

  describe "WebBlogController GET #show" do
    let(:article) do
      {
        id: "article-1",
        title: "記事1",
        publishedDate: "2026/02/10",
        content: "<p>本文1</p>",
        author: "著者1"
      }
    end

    it "存在する記事なら BlogDetail を返す" do
      allow(ArticlesShowUsecase).to receive(:call).with(article_id: "article-1").and_return(article)

      get :show, params: { article_id: "article-1" }

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;BlogDetail&quot;")
      expect(response.body).to include("記事1")
    end

    it "存在しない記事なら 404 を返す" do
      allow(ArticlesShowUsecase).to receive(:call).with(article_id: "missing").and_return(nil)

      get :show, params: { article_id: "missing" }

      expect(response).to have_http_status(:not_found)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;BlogDetail&quot;")
    end
  end
end
