require "rails_helper"

RSpec.describe "Malformed upstream content", type: :request do
  let(:endpoint) { Microcms::FetchArticlesService::ENDPOINT }
  let(:body) { "{" }

  before do
    stub_microcms_api_key
    stub_request(:get, endpoint).with(query: hash_including({})).to_return(status: 200, body:)
  end

  [ "/api/app/articles", "/feed.xml", "/sitemap.xml", "/api/app/masuda_run/rankings.json",
    "/api/app/sentence_articles", "/api/app/calendar_articles", "/api/app/bookshelf" ].each do |path|
    bodies = [ { contents: {}, totalCount: 1, limit: 10, offset: 0 }.to_json ]
    bodies += [ "{", "[]", { contents: [ nil ], totalCount: 1, limit: 10, offset: 0 }.to_json ] unless path.match?(/sentence|calendar|bookshelf/)
    bodies.each do |value|
      context "#{path}の上流本文が#{value.inspect}の場合" do
        let(:body) { value }
        let(:endpoint) { path.include?("rankings") ? Microcms::MasudaRun::FetchRankingsService::ENDPOINT : Microcms::FetchArticlesService::ENDPOINT }

        it "共通502・no-store・request IDを返して再送しない" do
          get path

          expect(response).to have_http_status(:bad_gateway)
          expect(response.media_type).to eq("application/json")
          expect(response.headers["Cache-Control"]).to eq("no-store")
          expect(response.headers["ETag"]).to be_nil
          expect(response.headers["X-Request-Id"]).to be_present
          expect(response.parsed_body).to eq("error" => {
            "code" => "upstream_server_error", "message" => ApplicationController::ERROR_MESSAGE_BY_CODE.fetch("upstream_server_error"),
            "request_id" => response.headers.fetch("X-Request-Id")
          })
          expect(a_request(:get, endpoint).with(query: hash_including({}))).to have_been_made.once
        end
      end
    end
  end
end
