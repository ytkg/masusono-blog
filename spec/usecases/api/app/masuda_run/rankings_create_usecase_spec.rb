require "rails_helper"

RSpec.describe Api::App::MasudaRun::RankingsCreateUsecase do
  subject(:result) { described_class.call(score: score, user_id: user_id) }

  let(:score) { 1234 }
  let(:user_id) { "cookie-user" }

  before do
    allow(PointsGrantService).to receive(:execute)
    allow(Microcms::MasudaRun::CreateRankingService).to receive(:execute).and_return({ id: "new-ranking-id" })
  end

  it do
    expect(result).to eq(
      {
        json: {
          id: "new-ranking-id",
          userId: "cookie-user",
          score: 1234
        }
      }
    )
  end

  it "ランキング登録後にスコア全額を付与する" do
    expect(Microcms::MasudaRun::CreateRankingService).to receive(:execute).ordered.and_return({ id: "new-ranking-id" })
    expect(PointsGrantService).to receive(:execute).with(user_id: user_id, amount: score).ordered
    result
  end

  it "付与に失敗してもランキングを返す" do
    allow(PointsGrantService).to receive(:execute).and_raise(PointsGrantService::Error, "unavailable")
    allow(Rails.logger).to receive(:warn)

    expect(result[:json][:id]).to eq("new-ranking-id")
    expect(Rails.logger).to have_received(:warn).with(hash_including(event: "masuda_run_points_grant_failed", ranking_id: "new-ranking-id"))
  end

  it "ランキング登録に失敗した場合は付与しない" do
    allow(Microcms::MasudaRun::CreateRankingService).to receive(:execute).and_raise(Faraday::TimeoutError)

    expect { result }.to raise_error(Faraday::TimeoutError)
    expect(PointsGrantService).not_to have_received(:execute)
  end

  context "0点の場合" do
    let(:score) { 0 }

    it "ポイントを付与せずランキングを返す" do
      expect(result[:json][:score]).to eq(0)
      expect(PointsGrantService).not_to have_received(:execute)
    end
  end

  context "scoreが数値でない場合" do
    let(:score) { "abc" }

    it do
      expect { result }.to raise_error(ArgumentError, "score must be a non-negative integer")
    end
  end

  context "scoreが負数の場合" do
    let(:score) { -1 }

    it do
      expect { result }.to raise_error(ArgumentError, "score must be a non-negative integer")
    end
  end

  context "user_idが空の場合" do
    let(:user_id) { "" }

    it do
      expect { result }.to raise_error(ArgumentError, "user_id is required")
    end
  end

  context "user_idが空白のみの場合" do
    let(:user_id) { "  " }

    it do
      expect { result }.to raise_error(ArgumentError, "user_id is required")
    end
  end
end
