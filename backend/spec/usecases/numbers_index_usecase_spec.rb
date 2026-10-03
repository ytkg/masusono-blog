require "rails_helper"

RSpec.describe NumbersIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    before do
      allow(Numbers::MetricsIndexUsecase).to receive(:call).and_return(
        {
          metrics: {
            blocks: [
              { label: "記事数", value: "12 本" }
            ]
          },
          status: :ok
        }
      )
    end

    it "Inertiaページ用の結果を返す" do
      expect(result).to eq(
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
