require "rails_helper"

RSpec.describe "WebNumbers", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /numbers" do
    before do
      allow(NumbersIndexUsecase).to receive(:call).and_return(
        {
          props: {
            metrics: {
              blocks: [
                { label: "記事数", value: "12 本" }
              ]
            }
          },
          status: :ok
        }
      )
    end

    it "Inertiaページを返す" do
      get "/numbers", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("numbers/index")
      expect(inertia.props.dig("metrics", "blocks", 0, "label")).to eq("記事数")
    end
  end
end
