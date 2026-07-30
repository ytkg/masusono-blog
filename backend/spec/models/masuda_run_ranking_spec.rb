require "rails_helper"

RSpec.describe MasudaRunRanking do
  describe ".all" do
    subject(:result) { described_class.all(limit: 10) }

    before do
      allow(Microcms::MasudaRun::FetchRankingsService).to receive(:execute).with(limit: 10).and_return([ { score: 123 } ])
    end

    it do
      expect(result).to eq([ { score: 123 } ])
    end
  end

  describe ".total_count" do
    subject(:result) { described_class.total_count }

    before do
      allow(Microcms::MasudaRun::FetchRankingsService).to receive(:fetch_total_count).and_return(42)
    end

    it do
      expect(result).to eq(42)
    end
  end
end
