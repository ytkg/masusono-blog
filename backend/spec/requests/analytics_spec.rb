require "rails_helper"

RSpec.describe "Analytics configuration", type: :request do
  before do
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with("GA4_MEASUREMENT_ID").and_return(measurement_id)
    allow(Rails.env).to receive(:production?).and_return(production)
    host! host
  end

  let(:measurement_id) { "G-5930S30RWS" }
  let(:production) { true }
  let(:host) { "masusono.com" }

  it "exposes the ID only on the production public host" do
    get "/about", headers: { "ACCEPT" => "text/html" }
    expect(response.body).to include('<meta name="ga4-measurement-id" content="G-5930S30RWS">')
  end

  context "in development" do
    let(:production) { false }

    it "omits the ID" do
      get "/about", headers: { "ACCEPT" => "text/html" }
      expect(response.body).not_to include('name="ga4-measurement-id"')
    end
  end

  context "on a preview host" do
    let(:host) { "masusono-preview-332902117625.asia-northeast1.run.app" }

    it "omits the ID" do
      get "/about", headers: { "ACCEPT" => "text/html" }
      expect(response.body).not_to include('name="ga4-measurement-id"')
    end
  end

  context "without a measurement ID" do
    let(:measurement_id) { nil }

    it "renders normally without analytics" do
      get "/about", headers: { "ACCEPT" => "text/html" }
      expect(response).to have_http_status(:ok)
      expect(response.body).not_to include('name="ga4-measurement-id"')
    end
  end

  it "keeps inert configuration on the management-tools page for later public navigation" do
    get "/others", headers: { "ACCEPT" => "text/html" }
    expect(response.body).to include('name="ga4-measurement-id"')
    expect(response.body).not_to include("googletagmanager.com")
  end
  describe "GET /api/app/analytics.json" do
    let(:browser_id) { "11111111-1111-4111-8111-111111111111" }

    let(:legacy_excluded_ids) { browser_id }

    before do
      allow(ENV).to receive(:fetch).with("GA4_EXCLUDED_BROWSER_IDS", "").and_return(legacy_excluded_ids)
    end

    it "returns only the policy decision for the current Cookie without caching, ignoring the legacy exclusion environment variable" do
      get "/api/app/analytics.json", headers: { "Cookie" => "user_id=#{browser_id}" }
      expect(response.parsed_body).to eq("allowed" => true)
      expect(response.headers["Cache-Control"]).to include("no-store")
    end

    context "for an excluded browser" do
      let(:browser_id) { "1fa05d1c-e9d5-4fc7-b0d2-578bc6951e0c" }
      let(:legacy_excluded_ids) { "" }

      it "excludes without exposing the exclusion list" do
        get "/api/app/analytics.json", headers: { "Cookie" => "user_id=#{browser_id}" }
        expect(response.parsed_body).to eq("allowed" => false)
        get "/about"
        expect(response.body).not_to include(*Analytics::ConfigurationUsecase::EXCLUDED_BROWSER_IDS)
      end
    end

    it "fails closed for missing or invalid cookies and ignores query identifiers" do
      get "/api/app/analytics.json", params: { user_id: browser_id }
      expect(response.parsed_body).to eq("allowed" => false)
      get "/api/app/analytics.json", headers: { "Cookie" => "user_id=invalid" }
      expect(response.parsed_body).to eq("allowed" => false)
    end
  end
end
