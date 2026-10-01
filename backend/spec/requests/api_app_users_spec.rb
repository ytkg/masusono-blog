require "rails_helper"

RSpec.describe "Api::App::Users", type: :request do
  describe "GET /api/app/users/:user_id.json" do
    before do
      allow(Api::App::Users::ShowUsecase).to receive(:call).and_return(
        {
          json: {
            userId: "cookie-user",
            name: "表示名太郎"
          },
          status: :ok
        }
      )
    end

    it "pathのuser_idを使ってユーザー表示名を取得する" do
      get "/api/app/users/cookie-user.json"

      expect(Api::App::Users::ShowUsecase).to have_received(:call).with(user_id: "cookie-user")
      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      expect(response.headers["Cache-Control"]).to eq("no-store")
      expect(JSON.parse(response.body)).to eq(
        {
          "userId" => "cookie-user",
          "name" => "表示名太郎"
        }
      )
    end
  end

  describe "GET /api/app/users/:user_id.json through microCMS" do
    let(:content_id) { "u-e329d2ee785ead849d97f03f875fd338" }
    let(:upstream_status) { 200 }
    let(:upstream_body) { { id: content_id, user_id: "cookie-user", name: "表示名太郎" }.to_json }

    before do
      stub_microcms_api_key
      stub_request(:get, "https://masusono.microcms.io/api/v1/users/#{content_id}")
        .with(headers: microcms_request_headers)
        .to_return(status: upstream_status, body: upstream_body, headers: json_response_headers)
    end

    it "正規IDで取得した表示名を従来のレスポンス契約で返す" do
      get "/api/app/users/cookie-user.json"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      expect(response.headers["Cache-Control"]).to eq("no-store")
      expect(JSON.parse(response.body)).to eq("userId" => "cookie-user", "name" => "表示名太郎")
    end

    context "未登録の場合" do
      let(:upstream_status) { 404 }
      let(:upstream_body) { { message: "Not found" }.to_json }

      it "200で表示名なしを返す" do
        get "/api/app/users/cookie-user.json"

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq("userId" => "cookie-user", "name" => nil)
      end
    end

    [ 401, 403 ].each do |status|
      context "microCMSが#{status}を返す場合" do
        let(:upstream_status) { status }
        let(:upstream_body) { { message: "Access denied" }.to_json }

        it "未登録扱いせず424の共通エラーを返す" do
          get "/api/app/users/cookie-user.json"

          expect(response).to have_http_status(424)
          expect(response.media_type).to eq("application/json")
          expect(response.headers["Cache-Control"]).to eq("no-store")
          request_id = response.headers["X-Request-Id"]
          expect(request_id).to be_present
          expect(JSON.parse(response.body)).to eq(
            "error" => {
              "code" => "upstream_client_error",
              "message" => ApplicationController::ERROR_MESSAGE_BY_CODE.fetch("upstream_client_error"),
              "request_id" => request_id
            }
          )
        end
      end
    end
  end

  describe "POST /api/app/users.json" do
    let(:params) { { name: "表示名太郎" } }

    before do
      allow(Api::App::Users::CreateUsecase).to receive(:call).and_return(
        {
          json: {
            id: "u-e329d2ee785ead849d97f03f875fd338",
            userId: "cookie-user",
            name: "表示名太郎"
          },
          status: :created
        }
      )
    end

    it "request bodyのuserIdを使ってユーザー表示名を登録する" do
      post "/api/app/users.json", params: params.merge(userId: "cookie-user")

      expect(Api::App::Users::CreateUsecase).to have_received(:call).with(name: "表示名太郎", user_id: "cookie-user")
      expect(response).to have_http_status(:created)
      expect(response.media_type).to eq("application/json")
      expect(response.headers["Cache-Control"]).to eq("no-store")
      expect(JSON.parse(response.body)).to eq(
        {
          "id" => "u-e329d2ee785ead849d97f03f875fd338",
          "userId" => "cookie-user",
          "name" => "表示名太郎"
        }
      )
    end

    it "不正リクエスト時は400を返す" do
      allow(Api::App::Users::CreateUsecase).to receive(:call).and_raise(ArgumentError, "user_id is required")

      post "/api/app/users.json", params: params

      expect(response).to have_http_status(:bad_request)
      expect(response.media_type).to eq("application/json")
      expect(response.headers["Cache-Control"]).to eq("no-store")
      expect(response.headers["ETag"]).to be_nil
      request_id = response.headers["X-Request-Id"]
      expect(request_id).to be_present
      expect(JSON.parse(response.body)).to eq(
        {
          "error" => {
            "code" => "invalid_request",
            "message" => "user_id is required",
            "request_id" => request_id
          }
        }
      )
    end
  end
end
