require "rails_helper"

RSpec.describe "Admin article editor", type: :request do
  let(:auth_client) { instance_double(Admin::AuthClient, login: { "access_token" => "access", "refresh_token" => "refresh" }, verify: true) }
  let(:article) { { id: "article-1", title: "記事", content: "<p>本文</p>", status: "PUBLISH", editable: true, content_editable: true, revision: "revision" } }

  before do
    allow(Admin::AuthClient).to receive(:new).and_return(auth_client)
    allow(Admin::ArticleEditorUsecase).to receive(:call).and_return({ props: { article:, authors: [] }, status: :ok })
  end

  around do |example|
    previous = ActionController::Base.allow_forgery_protection
    ActionController::Base.allow_forgery_protection = true
    example.run
  ensure
    ActionController::Base.allow_forgery_protection = previous
  end

  def login
    get "/api/app/management/session"
    post "/api/app/management/session", params: { username: "owner", password: "correct" }.to_json,
         headers: { "CONTENT_TYPE" => "application/json", "X-CSRF-Token" => response.parsed_body.fetch("csrf_token") }
    get "/api/app/management/session"
    response.parsed_body.fetch("csrf_token")
  end

  it "未認証では詳細を公開しない" do
    get "/api/app/management/articles/article-1"
    expect(response).to have_http_status(:unauthorized)
    expect(response.headers["Cache-Control"]).to include("no-store")
    expect(Admin::ArticleEditorUsecase).not_to have_received(:call)
  end

  it "詳細をno-store/noindexで返す" do
    login
    get "/api/app/management/articles/article-1"
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig("article", "content")).to eq("<p>本文</p>")
    expect(response.headers["Cache-Control"]).to include("no-store")
    expect(response.headers["X-Robots-Tag"]).to eq("noindex, nofollow")
  end

  it "CSRFトークンなしの更新を拒否する" do
    login
    patch "/api/app/management/articles/article-1", params: { article: { title: "修正" }, revision: "revision" }
    expect(response).to have_http_status(:unprocessable_content)
    expect(Admin::ArticleEditorUsecase).not_to have_received(:call)
  end

  it "許可された編集項目だけをusecaseに渡す" do
    token = login
    patch "/api/app/management/articles/article-1", params: { article: { title: "修正", tags: "タグ", status: "DRAFT" }, revision: "revision" }.to_json,
          headers: { "CONTENT_TYPE" => "application/json", "X-CSRF-Token" => token }
    expect(response).to have_http_status(:ok)
    expect(Admin::ArticleEditorUsecase).to have_received(:call).with(id: "article-1", attributes: { "title" => "修正" }, expected_revision: "revision")
  end

  it "競合を共通エラー形式で返す" do
    token = login
    allow(Admin::ArticleEditorUsecase).to receive(:call).and_raise(Microcms::Articles::EditorService::Error.new("article_conflict", "更新されています。", :conflict))
    patch "/api/app/management/articles/article-1", params: { article: { title: "修正" }, revision: "old" }.to_json,
          headers: { "CONTENT_TYPE" => "application/json", "X-CSRF-Token" => token }
    expect(response).to have_http_status(:conflict)
    expect(response.parsed_body["error"]).to include("code" => "article_conflict", "request_id" => a_kind_of(String))
    expect(response.headers["Cache-Control"]).to include("no-store")
  end
end
