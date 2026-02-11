require "rails_helper"

RSpec.describe AboutController, type: :controller do
  render_views

  describe "WebAboutController GET #show" do
    it "About の Inertia ページを返す" do
      get :show

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
      expect(response.body).to include("&quot;component&quot;:&quot;about/show&quot;")
    end
  end
end
