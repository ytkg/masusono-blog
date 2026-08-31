require "rails_helper"
require Rails.root.join("config/production_security")

RSpec.describe "Production request security", type: :request do
  let(:host_authorized_app) { ActionDispatch::HostAuthorization.new(Rails.application, ProductionSecurity::ALLOWED_HOSTS) }
  let(:ssl_app) { ActionDispatch::SSL.new(Rails.application) }

  it "redirects a direct HTTP request to HTTPS" do
    response = Rack::MockRequest.new(ssl_app).get("/", "HTTP_HOST" => "masusono.com")

    expect(response.status).to eq(301)
    expect(response["location"]).to eq("https://masusono.com/")
  end

  it "rejects an unapproved Host header" do
    response = Rack::MockRequest.new(host_authorized_app).get("/", "HTTP_HOST" => "attacker.example")

    expect(response.status).to eq(403)
  end

  it "allows /up only with an approved Host header" do
    response = Rack::MockRequest.new(host_authorized_app).get("/up", "HTTP_HOST" => "masusono.com")

    expect(response.status).to eq(200)
    expect(response.body).to include("background-color: green")
  end

  it "rejects /up with an unapproved Host header" do
    response = Rack::MockRequest.new(host_authorized_app).get("/up", "HTTP_HOST" => "attacker.example")

    expect(response.status).to eq(403)
  end

  it "allows the Cloud Run production and staging hostnames" do
    [ "masusono-332902117625.asia-northeast1.run.app",
      "masusono-feature-login-332902117625.asia-northeast1.run.app" ].each do |host|
      response = Rack::MockRequest.new(host_authorized_app).get("/up", "HTTP_HOST" => host)

      expect(response.status).to eq(200)
    end
  end
end
