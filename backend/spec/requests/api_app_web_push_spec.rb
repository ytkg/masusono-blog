require "rails_helper"

RSpec.describe "Api::App::WebPush", type: :request do
  describe "GET /api/app/web_push/subscription.json" do
    let(:endpoint) { "https://fcm.googleapis.com/fcm/send/example" }
    let(:subscriptions) { [ { endpoint: } ] }

    before do
      allow(Microcms::WebPushSubscriptionsService).to receive(:execute)
        .with(filters: "endpoint[equals]#{endpoint}").and_return(subscriptions)
    end

    it "配信対象に登録されているかを返す" do
      get "/api/app/web_push/subscription.json", params: { endpoint: }

      expect(response).to have_http_status(:ok)
      expect(response.headers["Cache-Control"]).to eq("no-store")
      expect(JSON.parse(response.body)).to eq("subscribed" => true)
    end

    context "配信対象に登録されていない場合" do
      let(:subscriptions) { [] }

      it "未購読として返す" do
        get "/api/app/web_push/subscription.json", params: { endpoint: }

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq("subscribed" => false)
      end
    end

    it "endpointがない場合は共通の入力エラーを返す" do
      get "/api/app/web_push/subscription.json"

      expect(response).to have_http_status(:bad_request)
      expect(JSON.parse(response.body).dig("error", "code")).to eq("invalid_request")
    end

    it "upstreamの失敗を未購読として扱わない" do
      allow(Microcms::WebPushSubscriptionsService).to receive(:execute)
        .and_raise(Microcms::FetchContentsService::FetchError.new(status: 503, body: "unavailable"))

      get "/api/app/web_push/subscription.json", params: { endpoint: }

      expect(response).to have_http_status(:bad_gateway)
      expect(response.headers["Cache-Control"]).to eq("no-store")
      expect(JSON.parse(response.body).dig("error", "code")).to eq("upstream_server_error")
    end
  end

  describe "GET /api/app/web_push/vapid_key.json" do
    before do
      allow(Api::App::WebPush::VapidPublicKeyUsecase).to receive(:call).and_return(
        { json: { publicKey: "public-vapid-key" }, status: :ok }
      )
    end

    it "VAPID公開鍵を返す" do
      get "/api/app/web_push/vapid_key.json"

      expect(response).to have_http_status(:ok)
      expect(response.headers["Cache-Control"]).to eq("no-store")
      expect(JSON.parse(response.body)).to eq({ "publicKey" => "public-vapid-key" })
    end
  end

  describe "POST /api/app/web_push/subscription.json" do
    let(:subscription) do
      { endpoint: "https://fcm.googleapis.com/fcm/send/example", keys: { p256dh: "key", auth: "auth" } }
    end

    before do
      allow(Api::App::WebPush::SubscriptionsCreateUsecase).to receive(:call).and_return(
        { json: { id: "subscription-id" }, status: :created }
      )
    end

    it "Push subscriptionを登録する" do
      post "/api/app/web_push/subscription.json", params: { subscription: }

      expect(Api::App::WebPush::SubscriptionsCreateUsecase).to have_received(:call).with(subscription: kind_of(ActionController::Parameters))
      expect(response).to have_http_status(:created)
      expect(response.headers["Cache-Control"]).to eq("no-store")
      expect(JSON.parse(response.body)).to eq({ "id" => "subscription-id" })
    end
  end

  describe "DELETE /api/app/web_push/subscription.json" do
    before do
      allow(Api::App::WebPush::SubscriptionsDestroyUsecase).to receive(:call).and_return(
        { json: {}, status: :no_content }
      )
    end

    it "Push subscriptionを削除する" do
      delete "/api/app/web_push/subscription.json", params: { endpoint: "https://fcm.googleapis.com/fcm/send/example" }

      expect(Api::App::WebPush::SubscriptionsDestroyUsecase).to have_received(:call).with(endpoint: "https://fcm.googleapis.com/fcm/send/example")
      expect(response).to have_http_status(:no_content)
      expect(response.headers["Cache-Control"]).to eq("no-store")
    end
  end
end
