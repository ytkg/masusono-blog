require "rails_helper"

RSpec.describe "WebNumbers", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /numbers" do
    before do
      allow(NumbersIndexUsecase).to receive(:call).and_return(
        {
          props: {
            metrics: {
              rows: [
                { label: "全体", articles: "12 本", chars: "120 字", averageChars: "10 字" }
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
      expect(inertia.props.dig("metrics", "rows", 0, "label")).to eq("全体")
    end
  end
end
