require "rails_helper"

RSpec.describe "WebHome", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /" do
    before do
      allow(HomeIndexUsecase).to receive(:call).and_return(
        {
          props: {
            articles: [
              {
                id: "article-1",
                title: "記事1"
              }
            ]
          },
          status: :ok
        }
      )
    end

    it "Inertiaページを返す" do
      get "/", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("home")
      expect(inertia.props).to include("app", "flash")
      expect(inertia.props.dig("articles", 0, "id")).to eq("article-1")
    end
  end

  describe "GET /about" do
    it "Inertiaページを返す" do
      get "/about", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("about")
    end
  end

  describe "GET /others" do
    it "Inertiaページを返す" do
      get "/others", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("others/index")
    end
  end

  describe "GET /authors" do
    before do
      allow(AuthorsIndexUsecase).to receive(:call).and_return(
        {
          props: {
            authors: [
              {
                id: "9wgrey2lh3",
                name: "増田",
                title: "友達と行事に全力で参加する人",
                bio: "プロフィール本文",
                imageUrl: "https://images.microcms-assets.io/assets/masuda.webp"
              }
            ]
          },
          status: :ok
        }
      )
    end

    it "Inertiaページを返す" do
      get "/authors", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("authors/index")
      expect(inertia.props.dig("authors", 0, "id")).to eq("9wgrey2lh3")
    end
  end

  describe "GET /zukan" do
    it "著者一覧へリダイレクトする" do
      get "/zukan", headers: html_headers

      expect(response).to redirect_to("/authors")
    end
  end

  describe "GET /authors/:author_id" do
    before do
      allow(AuthorShowUsecase).to receive(:call).with(author_id: "9wgrey2lh3").and_return(
        {
          props: {
            author: {
                id: "9wgrey2lh3",
                name: "増田"
            },
            articles: [
              {
                id: "article-1",
                title: "記事1"
              }
            ]
          },
          status: :ok
        }
      )
    end

    it "著者ページのInertiaページを返す" do
      get "/authors/9wgrey2lh3", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("authors/show")
      expect(inertia.props.dig("author", "id")).to eq("9wgrey2lh3")
      expect(inertia.props.dig("articles", 0, "id")).to eq("article-1")
    end
  end
end
