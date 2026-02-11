require "rails_helper"

RSpec.describe "API error contract", type: :request do
  def expect_error_response(status:, code:)
    expect(response).to have_http_status(status)
    expect(response.media_type).to eq("application/json")
    expect(response.headers["Cache-Control"]).to eq("no-store")
    expect(response.headers["ETag"]).to be_nil
    expect(JSON.parse(response.body)).to eq(
      {
        "error" => {
          "code" => code,
          "message" => ApplicationController::ERROR_MESSAGE_BY_CODE.fetch(code)
        }
      }
    )
  end

  [
    { path: "/app/numbers/metrics.json", usecase: App::Numbers::MetricsIndexUsecase },
    { path: "/app/masuda_run/rankings.json", usecase: App::MasudaRun::RankingsIndexUsecase },
    { path: "/sitemap.xml", usecase: SitemapsIndexUsecase }
  ].each do |target|
    describe "GET #{target[:path]}" do
      let(:path) { target[:path] }
      let(:usecase) { target[:usecase] }

      it "upstream 4xx を 424 + 統一JSONにマップする" do
        allow(usecase).to receive(:call).and_raise(
          Microcms::FetchContentsService::FetchError.new(status: 404, body: '{"message":"not found"}')
        )

        get path

        expect_error_response(status: 424, code: "upstream_client_error")
      end

      it "upstream 5xx を 502 + 統一JSONにマップする" do
        allow(usecase).to receive(:call).and_raise(
          Microcms::FetchContentsService::FetchError.new(status: 503, body: '{"message":"unavailable"}')
        )

        get path

        expect_error_response(status: :bad_gateway, code: "upstream_server_error")
      end

      it "タイムアウトを 504 + 統一JSONにマップする" do
        allow(usecase).to receive(:call).and_raise(Faraday::TimeoutError, "execution expired")

        get path

        expect_error_response(status: :gateway_timeout, code: "upstream_timeout")
      end

      it "接続エラーを 502 + 統一JSONにマップする" do
        allow(usecase).to receive(:call).and_raise(Faraday::ConnectionFailed, "connection failed")

        get path

        expect_error_response(status: :bad_gateway, code: "upstream_connection_error")
      end
    end
  end
end
