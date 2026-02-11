require "rails_helper"

RSpec.describe App::MasudaRun::RankingsIndexUsecase do
  subject(:result) { described_class.call }

  let(:rankings) do
    [
      {
        id: "c",
        user_id: "carol",
        score: 2000,
        createdAt: "2026-02-02T10:00:00.000Z"
      },
      {
        id: "b",
        user_id: "bob",
        score: 2000,
        createdAt: "2026-02-01T10:00:00.000Z"
      },
      {
        id: "a",
        user_id: "alice",
        score: 3000,
        createdAt: "2026-01-31T10:00:00.000Z"
      }
    ]
  end

  before do
    allow(MasudaRunRanking).to receive(:all).and_return(rankings)
  end

  it "取得順にrankを付け、rankedAtを整形する" do
    expect(result).to eq(
      {
        json: [
          {
            userId: "carol",
            score: 2000,
            rankedAt: "2026/02/02",
            rank: 1
          },
          {
            userId: "bob",
            score: 2000,
            rankedAt: "2026/02/01",
            rank: 2
          },
          {
            userId: "alice",
            score: 3000,
            rankedAt: "2026/01/31",
            rank: 3
          }
        ],
        status: :ok
      }
    )
  end
end
