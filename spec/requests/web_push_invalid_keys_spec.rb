require "rails_helper"

RSpec.describe "Web Push subscription key types", type: :request do
  before do
    allow(Microcms::WebPushSubscriptionsService).to receive(:upsert).and_return(id: "unexpected")
  end

  [ nil, "keys", [], true, false, 123, 1.5 ].each do |keys|
    it "keysが#{keys.inspect}なら外部保存せず400を返す" do
      post "/api/app/web_push/subscription.json", params: {
        subscription: { endpoint: "https://fcm.googleapis.com/id", keys: }
      }, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(response.parsed_body.dig("error", "code")).to eq("invalid_request")
      expect(response.parsed_body.dig("error", "request_id")).to eq(response.headers["X-Request-Id"])
      expect(response.headers["X-Request-Id"]).to be_present
      expect(response.headers["Cache-Control"]).to include("no-store")
      expect(Microcms::WebPushSubscriptionsService).not_to have_received(:upsert)
    end
  end

  %w[endpoint p256dh auth].each do |field|
    [ nil, true, false, 123, 1.5, [], {}, [ "key" ] ].each do |value|
      it "#{field}が文字列以外の#{value.inspect}なら保存せず400にする" do
        subscription = { endpoint: "https://fcm.googleapis.com/id", keys: { p256dh: "key", auth: "auth" } }
        field == "endpoint" ? subscription[:endpoint] = value : subscription[:keys][field.to_sym] = value

        post "/api/app/web_push/subscription.json", params: { subscription: }, as: :json

        expect(response).to have_http_status(:bad_request)
        expect(response.parsed_body.dig("error", "code")).to eq("invalid_request")
        expect(response.headers["Cache-Control"]).to eq("no-store")
        expect(Microcms::WebPushSubscriptionsService).not_to have_received(:upsert)
      end
    end
  end
end
