require "rails_helper"

RSpec.describe "WebNumbers", type: :request do
  let(:html_headers) { { "ACCEPT" => "text/html" } }

  describe "GET /numbers" do
    before do
      allow(NumbersIndexUsecase).to receive(:call).and_return(
        {
          props: {
            metrics: {
              distribution: Array.new(11) { |index| { minChars: index * 200, maxChars: index == 10 ? nil : index * 200 + 199, articles: index.zero? ? 12 : 0 } },
              rows: [
                { label: "全体", articles: "12 本", chars: "120 字", averageChars: "10 字" }
              ]
            }
          }
        }
      )
    end

    it "Inertiaページを返す" do
      get "/numbers", headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(inertia).to be_inertia_response
      expect(inertia).to render_component("numbers/index")
      expect(inertia.props.dig("metrics", "rows", 0, "label")).to eq("全体")
      expect(inertia.props.dig("metrics", "distribution").size).to eq(11)
      expect(inertia.props.dig("metrics", "distribution", 10)).to eq("minChars" => 2000, "maxChars" => nil, "articles" => 0)
      expect(inertia.props.dig("metrics", "distribution", 0)).to eq("minChars" => 0, "maxChars" => 199, "articles" => 12)
    end
  end
end
