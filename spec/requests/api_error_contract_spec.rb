require "rails_helper"

RSpec.describe "API error contract", type: :request do
  def expect_error_response(status:, code:)
    expect(response).to have_http_status(status)
    expect(response.media_type).to eq("application/json")
    expect(response.headers["Cache-Control"]).to eq("no-store")
    expect(response.headers["ETag"]).to be_nil
    request_id = response.headers["X-Request-Id"]
    expect(request_id).to be_present
    expect(JSON.parse(response.body)).to eq(
      {
        "error" => {
          "code" => code,
          "message" => ApplicationController::ERROR_MESSAGE_BY_CODE.fetch(code),
          "request_id" => request_id
        }
      }
    )
  end

  [
    { method: :get, path: "/api/app/masuda_run/rankings.json", params: nil, usecase: Api::App::MasudaRun::RankingsIndexUsecase },
    { method: :post, path: "/api/app/masuda_run/rankings.json", params: { score: 1234, userId: "cookie-user" }, usecase: Api::App::MasudaRun::RankingsCreateUsecase },
    { method: :get, path: "/api/app/users/cookie-user.json", params: nil, usecase: Api::App::Users::ShowUsecase },
    { method: :post, path: "/api/app/users.json", params: { name: "表示名太郎", userId: "cookie-user" }, usecase: Api::App::Users::CreateUsecase },
    { method: :get, path: "/sitemap.xml", params: nil, usecase: SitemapsIndexUsecase },
    { method: :get, path: "/feed.xml", params: nil, usecase: FeedsShowUsecase }
  ].each do |target|
    describe "#{target[:method].to_s.upcase} #{target[:path]}" do
      let(:path) { target[:path] }
      let(:method) { target[:method] }
      let(:params) { target[:params] }
      let(:usecase) { target[:usecase] }

      def perform_request(method, path, params)
        request_options = params ? { params: params } : {}
        public_send(method, path, **request_options)
      end

      it "upstream 4xx を 424 + 統一JSONにマップする" do
        allow(usecase).to receive(:call).and_raise(
          Microcms::FetchContentsService::FetchError.new(status: 404, body: '{"message":"not found"}')
        )

        perform_request(method, path, params)

        expect_error_response(status: 424, code: "upstream_client_error")
      end

      it "upstream 5xx を 502 + 統一JSONにマップする" do
        allow(usecase).to receive(:call).and_raise(
          Microcms::FetchContentsService::FetchError.new(status: 503, body: '{"message":"unavailable"}')
        )

        perform_request(method, path, params)

        expect_error_response(status: :bad_gateway, code: "upstream_server_error")
      end

      it "タイムアウトを 504 + 統一JSONにマップする" do
        allow(usecase).to receive(:call).and_raise(Faraday::TimeoutError, "execution expired")

        perform_request(method, path, params)

        expect_error_response(status: :gateway_timeout, code: "upstream_timeout")
      end

      it "接続エラーを 502 + 統一JSONにマップする" do
        allow(usecase).to receive(:call).and_raise(Faraday::ConnectionFailed, "connection failed")

        perform_request(method, path, params)

        expect_error_response(status: :bad_gateway, code: "upstream_connection_error")
      end
    end
  end
end
