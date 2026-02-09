require "rails_helper"

RSpec.describe "Metrics", type: :request do
  describe "GET /metrics" do
    let(:metrics) do
      {
        "blocks" => [
          {
            "label" => "ポッドキャスト総本数",
            "value" => "1 本"
          },
          {
            "label" => "ブログ",
            "value" => nil,
            "children" => [
              {
                "label" => "総記事数",
                "value" => "2 本",
                "children" => [
                  { "label" => "増田太郎の総記事数", "value" => "1 本" }
                ]
              }
            ]
          }
        ]
      }
    end

    before do
      allow(MetricsIndexUsecase).to receive(:call).and_return({ metrics: metrics })
    end

    it "キー・型・件数・代表値を満たす" do
      get "/metrics"

      expect(response).to have_http_status(:ok)
      payload = JSON.parse(response.body)
      expect(payload.keys).to eq([ "blocks" ])
      expect(payload["blocks"]).to be_an(Array)
      expect(payload["blocks"].size).to eq(2)
      expect(payload["blocks"].first["value"]).to eq("1 本")
      expect(payload["blocks"].second["label"]).to eq("ブログ")
      expect(payload["blocks"].second["children"]).to be_an(Array)
    end
  end
end
