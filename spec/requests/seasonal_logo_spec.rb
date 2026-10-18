require "rails_helper"

RSpec.describe "Seasonal logo preference", type: :request do
  before do
    allow(SearchIndexUsecase).to receive(:call).and_return(props: { articles: [] })
  end

  [ [ nil, false ], [ "off", false ], [ "on", true ], [ "invalid", false ] ].each do |value, enabled|
    it "Cookie #{value.inspect} を共有propsに反映する" do
      get "/search", headers: {
        "X-Inertia" => "true", "X-Inertia-Version" => "development",
        "Cookie" => "seasonal_logo_20261018_autumn_health=#{value}"
      }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("props", "app", "seasonalLogoEnabled")).to eq(enabled)
      expect(response.headers["Cache-Control"]).to include("private")
    end
  end
  it "共通キーや別の限定ロゴのCookieを引き継がない" do
    get "/search", headers: {
      "X-Inertia" => "true", "X-Inertia-Version" => "development",
      "Cookie" => "seasonal_logo=on; seasonal_logo_other_campaign=on"
    }

    expect(response.parsed_body.dig("props", "app", "seasonalLogoEnabled")).to be(false)
  end
end
