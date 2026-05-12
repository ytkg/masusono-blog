require "rails_helper"

RSpec.describe "Api::App::Numbers", type: :request do
  describe "GET /api/app/numbers/metrics.json" do
    before do
      allow(Api::App::Numbers::MetricsIndexUsecase).to receive(:call).and_return(
        {
          json: {
            "blocks" => [
              {
                "label" => "増田RUN総プレイ回数",
                "value" => "10 回"
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
      expect(payload["blocks"].first["label"]).to eq("増田RUN総プレイ回数")
    end
  end
end
