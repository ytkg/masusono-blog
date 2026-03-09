require "rails_helper"

RSpec.describe "Api::App::Numbers", type: :request do
  describe "GET /api/app/numbers/metrics.json" do
    before do
      allow(Api::App::Numbers::MetricsIndexUsecase).to receive(:call).and_return(
        {
          json: {
            "blocks" => [
              {
                "label" => "ポッドキャスト総本数",
                "value" => "1 本"
              }
            ]
          },
          status: :ok
        }
      )
    end

    it "JSONを返す" do
      get "/api/app/numbers/metrics.json"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      expect(response.headers["Cache-Control"]).to eq("no-store")
      payload = JSON.parse(response.body)
      expect(payload["blocks"]).to be_an(Array)
      expect(payload["blocks"].first["label"]).to eq("ポッドキャスト総本数")
    end
  end
end
