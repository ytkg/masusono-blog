require "rails_helper"

RSpec.describe NumbersIndexUsecase do
  describe ".call" do
    subject(:result) { described_class.call }

    before do
      allow(Numbers::MetricsIndexUsecase).to receive(:call).and_return(
        {
          metrics: {
            rows: [
              { label: "全体", articles: "12 本", chars: "120 字", averageChars: "10 字" }
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
              rows: [
                { label: "全体", articles: "12 本", chars: "120 字", averageChars: "10 字" }
              ]
            }
          },
          status: :ok
        }
      )
    end
  end
end
