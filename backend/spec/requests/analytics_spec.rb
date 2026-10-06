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
end
