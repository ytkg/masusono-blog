require "rails_helper"

RSpec.describe HomeController, type: :controller do
  render_views

  describe "WebHomeController GET #show" do
    it "Home の Inertia ページを返す" do
      get :show

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;Home&quot;")
    end
  end
end
