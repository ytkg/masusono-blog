require "rails_helper"

RSpec.describe "API string input contract", type: :request do
  before do
    allow(Microcms::MasudaRun::CreateRankingService).to receive(:execute).and_return({ id: "ranking" })
    allow(Microcms::Users::UpsertByContentIdService).to receive(:execute)
    allow(PointsGrantService).to receive(:execute)
  end

  [
    [ "/api/app/masuda_run/rankings.json", { userId: "user", score: 1 }, :userId, "user_id" ],
    [ "/api/app/users.json", { userId: "user", name: "名前" }, :userId, "user_id" ],
    [ "/api/app/users.json", { userId: "user", name: "名前" }, :name, "name" ]
  ].each do |path, valid, field, error_field|
    [ 123, true, false, [], {}, nil, "", "  " ].each do |value|
      it "#{path}の#{field}=#{value.inspect}を400で拒否する" do
        post path, params: valid.merge(field => value), as: :json

        expect(response).to have_http_status(:bad_request)
        expect(response.headers["Cache-Control"]).to eq("no-store")
        expect(response.headers["ETag"]).to be_nil
        expect(response.parsed_body).to eq("error" => {
          "code" => "invalid_request", "message" => value.nil? || value.is_a?(String) ? "#{error_field} is required" : "#{error_field} must be a string",
          "request_id" => response.headers.fetch("X-Request-Id")
        })
        expect(Microcms::MasudaRun::CreateRankingService).not_to have_received(:execute)
        expect(Microcms::Users::UpsertByContentIdService).not_to have_received(:execute)
        expect(PointsGrantService).not_to have_received(:execute)
      end
    end
  end

  it "Users APIの文字列を前後空白だけ正規化して保存する" do
    post "/api/app/users.json", params: { userId: " cookie-user ", name: " 表示名😊 " }, as: :json

    expect(response).to have_http_status(:created)
    expect(response.parsed_body).to eq("id" => Microcms::Users::Identity.content_id("cookie-user"), "userId" => "cookie-user", "name" => "表示名😊")
    expect(Microcms::Users::UpsertByContentIdService).to have_received(:execute).with(
      content_id: Microcms::Users::Identity.content_id("cookie-user"), user_id: "cookie-user", name: "表示名😊")
  end
end
