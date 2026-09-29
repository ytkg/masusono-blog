require "rails_helper"

RSpec.describe "Admin", type: :request do
  let(:auth_client) { instance_double(Admin::AuthClient) }

  before do
    allow(Admin::AuthClient).to receive(:new).and_return(auth_client)
  end

  it "未ログインではダッシュボードとメディアを表示しない" do
    get "/admin"
    expect(response).to redirect_to("/admin/login")

    get "/admin/media.json"
    expect(response).to redirect_to("/admin/login")
  end

  it "認証サービスでログインしてダッシュボードを表示する" do
    allow(auth_client).to receive(:login).with(username: "owner", password: "correct").and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).with(access_token: "access").and_return(true)

    post "/admin/login", params: { username: "owner", password: "correct" }
    expect(response).to redirect_to("/admin")

    get "/admin"
    expect(response).to have_http_status(:ok)
    expect(inertia).to render_component("admin/dashboard")
    expect(inertia.props.to_json).not_to include("access", "refresh")
    expect(response.headers["cache-control"]).to include("no-store")
    expect(response.headers["X-Robots-Tag"]).to eq("noindex, nofollow")
  end

  it "認証失敗時は管理画面に入れない" do
    allow(auth_client).to receive(:login).and_return(nil)

    post "/admin/login", params: { username: "owner", password: "wrong" }
    expect(response).to have_http_status(:unauthorized)
    expect(inertia).to render_component("admin/login")

    get "/admin"
    expect(response).to redirect_to("/admin/login")
  end

  it "認証後はメディア一覧をJSONでも取得できる" do
    allow(auth_client).to receive(:login).and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).and_return(true)
    allow(Admin::MediaIndexUsecase).to receive(:call).with(query: "sample", page: "2").and_return(
      { props: { media: [ { id: "image-1", url: "https://example.com/sample.png" } ], page: 2, has_more: false }, status: :ok }
    )

    post "/admin/login", params: { username: "owner", password: "correct" }
    get "/admin/media.json", params: { q: "sample", page: "2" }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig("media", 0, "id")).to eq("image-1")
    expect(response.headers["cache-control"]).to include("no-store")
  end

  it "認証後はメディア一覧画面を表示する" do
    allow(auth_client).to receive(:login).and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).and_return(true)
    allow(Admin::MediaIndexUsecase).to receive(:call).and_return(
      { props: { media: [], total_count: 0, has_more: false, page: 1, query: "" }, status: :ok }
    )

    post "/admin/login", params: { username: "owner", password: "correct" }
    get "/admin/media"

    expect(response).to have_http_status(:ok)
    expect(inertia).to render_component("admin/media")
    expect(inertia.props["media"]).to eq([])
  end
end
