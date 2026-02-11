require "rails_helper"

RSpec.describe BlogController, type: :controller do
  render_views

  describe "WebBlogController GET #index" do
    it "Blog の Inertia ページを返す" do
      allow(BlogIndexUsecase).to receive(:call).and_return(
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
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("blog/index")
      expect(inertia.props.dig("articles", 0, "title")).to eq("記事1")
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
      allow(BlogShowUsecase).to receive(:call).with(article_id: "article-1").and_return(
        { article: article, status: :ok }
      )

      get :show, params: { article_id: "article-1" }

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("blog/show")
      expect(inertia.props.dig("article", "title")).to eq("記事1")
    end

    it "存在しない記事なら 404 を返す" do
      allow(BlogShowUsecase).to receive(:call).with(article_id: "missing").and_return(
        { article: nil, status: :not_found }
      )

      get :show, params: { article_id: "missing" }

      expect(response).to have_http_status(:not_found)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("blog/show")
      expect(inertia.props.dig("article")).to be_nil
    end
  end
end
