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
      expect(JSON.parse(response.body)).to eq(
        {
          "userId" => "cookie-user",
          "name" => "表示名太郎"
        }
      )
    end
  end

  describe "POST /api/app/users.json" do
    let(:params) { { name: "表示名太郎" } }

    before do
      allow(Api::App::Users::CreateUsecase).to receive(:call).and_return(
        {
          json: {
            id: "new-user-id",
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
      expect(JSON.parse(response.body)).to eq(
        {
          "id" => "new-user-id",
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
      expect(JSON.parse(response.body)).to eq(
        {
          "error" => {
            "code" => "invalid_request",
            "message" => "user_id is required"
          }
        }
      )
    end
  end
end
