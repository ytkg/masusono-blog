require "rails_helper"

RSpec.describe NumbersIndexUsecase do
  describe ".call" do
    before do
      allow(Api::App::Numbers::MetricsIndexUsecase).to receive(:call).and_return(
        {
          json: {
            blocks: [
              { label: "記事数", value: "12 本" }
            ]
          },
          status: :ok
        }
      )
    end

    it "Inertiaページ用の結果を返す" do
      expect(described_class.call).to eq(
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
  end
end
