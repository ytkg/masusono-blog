require "rails_helper"

RSpec.describe "Masuda tataki points", type: :request do
  let(:params) { { userId: "player", score: 150 } }

  before do
    stub_request(:post, PointsGrantService::ENDPOINT).to_return(status: 200)
  end

  def submit
    post "/api/app/masuda_tataki/points.json", params: params
  end

  it "grants the score to the player" do
    submit
    expect(response).to have_http_status(:created)
    expect(response.headers["Cache-Control"]).to eq("no-store")
    expect(JSON.parse(response.body)).to eq("userId" => "player", "score" => 150)
    expect(a_request(:post, PointsGrantService::ENDPOINT)
      .with(body: { userId: "player", amount: 150 }.to_json)).to have_been_made.once
  end

  context "with zero score" do
    let(:params) { super().merge(score: 0) }

    it "succeeds without granting points" do
      submit
      expect(response).to have_http_status(:created)
      expect(a_request(:post, PointsGrantService::ENDPOINT)).not_to have_been_made
    end
  end

  [ -1, 1.5, "invalid", PointsGrantService::MAX_AMOUNT + 1 ].each do |score|
    it "rejects invalid score #{score}" do
      post "/api/app/masuda_tataki/points.json", params: params.merge(score: score), as: :json
      expect(response).to have_http_status(:bad_request)
      expect(a_request(:post, PointsGrantService::ENDPOINT)).not_to have_been_made
    end
  end

  it "rejects missing user ID" do
    post "/api/app/masuda_tataki/points.json", params: { score: 150 }
    expect(response).to have_http_status(:bad_request)
    expect(a_request(:post, PointsGrantService::ENDPOINT)).not_to have_been_made
  end

  it "returns the common upstream error without retrying" do
    stub_request(:post, PointsGrantService::ENDPOINT).to_timeout
    submit
    expect(response).to have_http_status(:bad_gateway)
    expect(response.headers["Cache-Control"]).to eq("no-store")
    expect(JSON.parse(response.body)).to eq("error" => {
      "code" => "upstream_error", "message" => ApplicationController::ERROR_MESSAGE_BY_CODE.fetch("upstream_error"),
      "request_id" => response.headers["X-Request-Id"]
    })
    expect(a_request(:post, PointsGrantService::ENDPOINT)).to have_been_made.once
  end
end
