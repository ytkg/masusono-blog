require "rails_helper"

RSpec.describe "App::Numbers", type: :request do
  describe "GET /app/numbers/metrics.json" do
    before do
      allow(App::Numbers::MetricsIndexUsecase).to receive(:call).and_return(
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
      get "/app/numbers/metrics.json"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      payload = JSON.parse(response.body)
      expect(payload["blocks"]).to be_an(Array)
      expect(payload["blocks"].first["label"]).to eq("ポッドキャスト総本数")
    end
  end
end
