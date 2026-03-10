require "rails_helper"

RSpec.describe "Healthcheck", type: :request do
  describe "GET /up" do
    it "200 を返す" do
      get "/up"

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include('background-color: green')
    end
  end
end
