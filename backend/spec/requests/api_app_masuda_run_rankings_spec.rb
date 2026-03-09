require "rails_helper"

RSpec.describe "Api::App::MasudaRun::Rankings", type: :request do
  describe "GET /api/app/masuda_run/rankings.json" do
    before do
      allow(Api::App::MasudaRun::RankingsIndexUsecase).to receive(:call).and_return(
        {
          json: [
            {
              userId: "alice",
              score: 1000,
              rankedAt: "2026/02/11",
              rank: 1
            }
          ],
          status: :ok
        }
      )
    end

    it "JSONを返す" do
      get "/api/app/masuda_run/rankings.json"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      expect(response.headers["Cache-Control"]).to eq("no-store")
      payload = JSON.parse(response.body)
      expect(payload).to be_an(Array)
      expect(payload.first["userId"]).to eq("alice")
    end
  end

  describe "POST /api/app/masuda_run/rankings.json" do
    let(:params) { { score: 1234 } }

    before do
      allow(Api::App::MasudaRun::RankingsCreateUsecase).to receive(:call).and_return(
        {
          json: {
            id: "new-ranking-id",
            userId: "cookie-user",
            score: 1234
          },
          status: :created
        }
      )
    end

    it "request bodyのuserIdを使ってランキングを登録する" do
      post "/api/app/masuda_run/rankings.json", params: params.merge(userId: "cookie-user")

      expect(Api::App::MasudaRun::RankingsCreateUsecase).to have_received(:call).with(score: "1234", user_id: "cookie-user")
      expect(response).to have_http_status(:created)
      expect(response.media_type).to eq("application/json")
      expect(response.headers["Cache-Control"]).to eq("no-store")
      expect(JSON.parse(response.body)).to eq(
        {
          "id" => "new-ranking-id",
          "userId" => "cookie-user",
          "score" => 1234
        }
      )
    end

    it "不正リクエスト時は400を返す" do
      allow(Api::App::MasudaRun::RankingsCreateUsecase).to receive(:call).and_raise(ArgumentError, "user_id is required")

      post "/api/app/masuda_run/rankings.json", params: params

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
