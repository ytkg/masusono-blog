require "rails_helper"

RSpec.describe "Dashboard", type: :request do
  before do
    allow(Numbers::MetricsQuery).to receive(:call).and_return(metrics: { rows: [] })
  end

  it "認証なしで dashboard ホストに専用ページを返す" do
    host! "dashboard.masusono.com"
    get "/", headers: { "ACCEPT" => "text/html" }

    expect(response).to have_http_status(:ok)
    expect(inertia).to render_component("dashboard/home")
    expect(inertia.props.dig("metrics", "rows")).to eq([])
  end

  it "ローカルの dashboard サブドメインも同じページを返す" do
    host! "dashboard.lvh.me"
    get "/", headers: { "ACCEPT" => "text/html" }

    expect(inertia).to render_component("dashboard/home")
  end

  it "本番ブログと PR ステージングの入口を維持する" do
    allow(HomeIndexUsecase).to receive(:call).and_return(props: {})
    [ "masusono.com", "masusono-feature-332902117625.asia-northeast1.run.app" ].each do |host|
      host! host
      get "/", headers: { "ACCEPT" => "text/html" }

      expect(response).to have_http_status(:ok)
      expect(inertia).to render_component("home")
    end
  end

  it "dashboard ではブログのルートを公開しない" do
    host! "dashboard.masusono.com"
    get "/about"

    expect(response).to have_http_status(:not_found)
  end
end
