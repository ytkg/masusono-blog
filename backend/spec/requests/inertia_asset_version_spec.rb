require "rails_helper"

RSpec.describe "Inertia asset version", type: :request do
  let(:version) { "boot-asset-version" }
  let(:headers) { { "HTTP_X_INERTIA" => "true", "HTTP_X_INERTIA_VERSION" => version } }

  around do |example|
    previous_version = InertiaRails.configuration.version
    InertiaRails.configuration.version = version
    example.run
  ensure
    InertiaRails.configuration.version = previous_version
  end

  before do
    allow(ViteRuby).to receive(:digest).and_raise("asset version must not be recalculated during a request")
  end

  it "同じバージョンでページのJSONを返す" do
    get "/about", headers: headers

    expect(response).to have_http_status(:ok)
    expect(response.headers["X-Inertia"]).to eq("true")
    expect(response.parsed_body["version"]).to eq(version)
  end

  it "古いバージョンには従来どおり409とリロード先を返す" do
    get "/about", headers: headers.merge("HTTP_X_INERTIA_VERSION" => "old-asset-version")

    expect(response).to have_http_status(:conflict)
    expect(response.headers["X-Inertia-Location"]).to end_with("/about")
  end

  it "複数のリクエストが同時に来ても、ファイル走査なしで同じバージョンを返す" do
    get "/about", headers: headers
    requests = 12.times.map do
      Thread.new do
        5.times.map do
          result = Rack::MockRequest.new(Rails.application).get("/about", headers)
          [ result.status, JSON.parse(result.body)["version"] ]
        end
      end
    end

    expect(requests.flat_map(&:value)).to eq([ [ 200, version ] ] * 60)
  end
end
