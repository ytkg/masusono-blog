require "rails_helper"

RSpec.describe "Api::App::WebPush", type: :request do
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
