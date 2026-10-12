require "rails_helper"

RSpec.describe "Admin mini app", type: :request do
  let(:auth_client) { instance_double(Admin::AuthClient) }

  before do
    allow(Admin::AuthClient).to receive(:new).and_return(auth_client)
  end

  around do |example|
    previous = ActionController::Base.allow_forgery_protection
    ActionController::Base.allow_forgery_protection = true
    example.run
  ensure
    ActionController::Base.allow_forgery_protection = previous
  end

  def login(username:, password:)
    get "/api/app/management/session"
    token = response.parsed_body.fetch("csrf_token")
    post "/api/app/management/session",
         params: { username:, password: }.to_json,
         headers: { "CONTENT_TYPE" => "application/json", "X-CSRF-Token" => token }
  end

  it "未ログインでは状態だけを返し、メディアを公開しない" do
    get "/api/app/management/session"
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["authenticated"]).to be(false)
    expect(response.parsed_body["csrf_token"]).to be_present

    get "/api/app/management/media", headers: { "Accept" => "application/json" }
    expect(response).to have_http_status(:unauthorized)
    expect(response.parsed_body.dig("error", "code")).to eq("unauthorized")
    expect(response.headers["cache-control"]).to include("no-store")
    expect(response.headers["X-Robots-Tag"]).to eq("noindex, nofollow")
  end

  it "認証サービスでログインし、ミニアプリ内の状態を取得する" do
    allow(auth_client).to receive(:login).with(username: "owner", password: "correct").and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).with(access_token: "access").and_return(true)

    login(username: "owner", password: "correct")
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body["authenticated"]).to be(true)
    expect(response.body).not_to include("access", "refresh")

    get "/api/app/management/session"
    expect(response.parsed_body["authenticated"]).to be(true)
  end

  it "認証失敗時はメディアを取得できない" do
    allow(auth_client).to receive(:login).and_return(nil)

    login(username: "owner", password: "wrong")
    expect(response).to have_http_status(:unauthorized)
    expect(response.parsed_body.dig("error", "code")).to eq("invalid_credentials")

    get "/api/app/management/media"
    expect(response).to have_http_status(:unauthorized)
  end

  it "CSRFトークンのないログインを拒否する" do
    get "/api/app/management/session"

    post "/api/app/management/session", params: { username: "owner", password: "correct" }
    expect(response).to have_http_status(:unprocessable_content)
  end

  it "認証後はメディア一覧をJSONで取得する" do
    allow(auth_client).to receive(:login).and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).and_return(true)
    allow(Admin::MediaIndexUsecase).to receive(:call).with(query: "sample", page: "2", cursor: "next").and_return(
      { props: { media: [ { id: "image-1", url: "https://example.com/sample.png" } ], page: 2, has_more: false }, status: :ok }
    )

    login(username: "owner", password: "correct")
    get "/api/app/management/media", params: { q: "sample", page: "2", token: "next" }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig("media", 0, "id")).to eq("image-1")
    expect(response.headers["cache-control"]).to include("no-store")
  end

  it "認証後は記事一覧をJSONで取得する" do
    allow(auth_client).to receive(:login).and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).and_return(true)
    allow(Admin::ArticlesIndexUsecase).to receive(:call).with(query: "下書き", status: "published_and_draft", page: "2").and_return(
      { props: { articles: [ { id: "article-1", title: "下書きタイトル", status: "PUBLISH_AND_DRAFT" } ], page: 2, has_more: false }, status: :ok }
    )

    login(username: "owner", password: "correct")
    get "/api/app/management/articles", params: { q: "下書き", status: "published_and_draft", page: "2" }

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body.dig("articles", 0, "title")).to eq("下書きタイトル")
    expect(response.headers["cache-control"]).to include("no-store")
  end

  it "認証済みでCSRFトークンを送ると画像をアップロードできる" do
    allow(auth_client).to receive(:login).and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).and_return(true)
    allow(Microcms::UploadMediaService).to receive(:call).and_return({ "id" => "image-1", "url" => "https://example.com/image.png" })

    login(username: "owner", password: "correct")
    get "/api/app/management/session"
    token = response.parsed_body.fetch("csrf_token")
    file = Rack::Test::UploadedFile.new(StringIO.new("\x89PNG\r\n\x1A\n"), "image/png", original_filename: "image.png")

    post "/api/app/management/media", params: { file: }, headers: { "X-CSRF-Token" => token }

    expect(response).to have_http_status(:created)
    expect(response.parsed_body.dig("media", "id")).to eq("image-1")
    expect(Microcms::UploadMediaService).to have_received(:call).with(file: an_instance_of(ActionDispatch::Http::UploadedFile))
    expect(response.body).not_to include("access", "refresh")
  end

  it "CSRFトークンなしのアップロードを拒否する" do
    allow(auth_client).to receive(:login).and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).and_return(true)

    login(username: "owner", password: "correct")
    file = Rack::Test::UploadedFile.new(StringIO.new("\x89PNG\r\n\x1A\n"), "image/png", original_filename: "image.png")

    post "/api/app/management/media", params: { file: }

    expect(response).to have_http_status(:unprocessable_content)
  end

  it "アップロードサービスの検証エラーを返す" do
    allow(auth_client).to receive(:login).and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).and_return(true)
    error = Microcms::UploadMediaService::ValidationError.new("invalid_file_type", "画像ファイルを選択してください。")
    allow(Microcms::UploadMediaService).to receive(:call).and_raise(error)

    login(username: "owner", password: "correct")
    get "/api/app/management/session"
    token = response.parsed_body.fetch("csrf_token")
    file = Rack::Test::UploadedFile.new(StringIO.new("text"), "text/plain", original_filename: "file.txt")

    post "/api/app/management/media", params: { file: }, headers: { "X-CSRF-Token" => token }

    expect(response).to have_http_status(:unprocessable_content)
    expect(response.parsed_body.dig("error", "code")).to eq("invalid_file_type")
  end

  it "microCMSへのアップロード失敗を502で返す" do
    allow(auth_client).to receive(:login).and_return(
      { "access_token" => "access", "refresh_token" => "refresh" }
    )
    allow(auth_client).to receive(:verify).and_return(true)
    allow(Microcms::UploadMediaService).to receive(:call).and_raise(Microcms::UploadMediaService::UploadError)

    login(username: "owner", password: "correct")
    get "/api/app/management/session"
    token = response.parsed_body.fetch("csrf_token")
    file = Rack::Test::UploadedFile.new(StringIO.new("\x89PNG\r\n\x1A\n"), "image/png", original_filename: "image.png")

    post "/api/app/management/media", params: { file: }, headers: { "X-CSRF-Token" => token }

    expect(response).to have_http_status(:bad_gateway)
    expect(response.parsed_body.dig("error", "code")).to eq("media_upload_failed")
  end
end
