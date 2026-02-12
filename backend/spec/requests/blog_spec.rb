require "rails_helper"

RSpec.describe "WebBlog", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /blog" do
    it "Inertiaページを返す" do
      get "/blog", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component(:blog)
      expect(inertia.props["articles"]).to be_nil
    end
  end

  describe "GET /blog/:article_id" do
    it "詳細Inertiaページを返す" do
      get "/blog/article-1", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component(:blog_detail)
      expect(inertia.props["article"]).to be_nil
    end
  end
end
