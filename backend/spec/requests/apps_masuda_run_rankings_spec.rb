require "rails_helper"

RSpec.describe "App::MasudaRun::Rankings", type: :request do
  describe "GET /app/masuda_run/rankings.json" do
    before do
      allow(App::MasudaRun::RankingsIndexUsecase).to receive(:call).and_return(
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
      get "/app/masuda_run/rankings.json"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      payload = JSON.parse(response.body)
      expect(payload).to be_an(Array)
      expect(payload.first["userId"]).to eq("alice")
    end
  end
end
