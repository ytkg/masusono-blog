require "rails_helper"

RSpec.describe "Public authors", type: :request do
  let(:endpoint) { Microcms::FetchAuthorsService::ENDPOINT }
  let(:headers) { { "ACCEPT" => "text/html" } }

  it "著者一覧を上流から取得して公開用のプロフィールを返す" do
    stub_microcms_get(endpoint:, query: { limit: "100", offset: "0", orders: "publishedAt" },
                      contents: [ { id: "author-1", name: "著者", title: "肩書き", bio: "紹介" } ])

    get "/authors", headers: headers

    expect(response).to have_http_status(:ok)
    expect(inertia).to render_component("authors/index")
    expect(inertia.props["authors"]).to contain_exactly(
      "id" => "author-1", "name" => "著者", "title" => "肩書き", "bio" => "紹介", "imageUrl" => nil
    )
  end

  it "存在しない著者に404を返し、記事の取得を開始しない" do
    stub_microcms_get(endpoint:, query: { limit: "100", offset: "0", orders: "publishedAt", ids: "missing" }, contents: [])

    get "/authors/missing", headers: headers

    expect(response).to have_http_status(:not_found)
    expect(inertia).to render_component("errors/not_found")
    expect(WebMock).not_to have_requested(:get, Microcms::FetchArticlesService::ENDPOINT).with(query: hash_including({}))
  end
end
