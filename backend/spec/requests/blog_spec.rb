require "rails_helper"

RSpec.describe "WebBlog", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /blog" do
    before do
      allow(BlogIndexUsecase).to receive(:call).and_return(
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

    it "Inertiaページを返す" do
      get "/blog", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("blog/index")
      expect(inertia.props.dig("articles", 0, "id")).to eq("article-1")
    end
  end

  describe "GET /blog/:article_id" do
    context "記事が存在する場合" do
      before do
        allow(BlogShowUsecase).to receive(:call).with(article_id: "article-1").and_return(
          {
            article: {
              id: "article-1",
              title: "記事1",
              publishedDate: "2026/02/10",
              content: "<p>本文</p>",
              author: "著者"
            }
          }
        )
      end

      it "詳細Inertiaページを返す" do
        get "/blog/article-1", headers: html_headers

        expect(response).to have_http_status(:ok)
        expect(inertia).to be_inertia_response
        expect(inertia).to render_component("blog/show")
        expect(inertia.props.dig("article", "id")).to eq("article-1")
      end
    end

    context "記事が存在しない場合" do
      before do
        allow(BlogShowUsecase).to receive(:call).with(article_id: "missing").and_return(
          {
            article: nil
          }
        )
      end

      it "Inertiaの404ページを返す" do
        get "/blog/missing", headers: html_headers

        expect(response).to have_http_status(:not_found)
        expect(inertia).to be_inertia_response
        expect(inertia).to render_component("errors/not_found")
      end
    end
  end
end
