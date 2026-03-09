require "rails_helper"

RSpec.describe Api::App::MasudaRun::RankingsIndexUsecase do
  subject(:result) { described_class.call }

  let(:rankings) do
    [
      {
        id: "c",
        user_id: "carol",
        score: 2000,
        createdAt: "2026-02-02T18:00:00.000Z"
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
      },
      {
        id: "x",
        user_id: "",
        score: 1500,
        createdAt: "2026-01-30T10:00:00.000Z"
      }
    ]
  end

  before do
    allow(MasudaRunRanking).to receive(:all).with(limit: described_class::RANKINGS_LIMIT).and_return(rankings)
    allow(Microcms::Users::FetchByUserIdService).to receive(:execute).with(user_id: "carol").and_return({ name: "Carol" })
    allow(Microcms::Users::FetchByUserIdService).to receive(:execute).with(user_id: "bob").and_return({})
    allow(Microcms::Users::FetchByUserIdService).to receive(:execute).with(user_id: "alice").and_return({ name: "Alice" })
  end

  it "取得順にrankを付け、表示名とrankedAtを整形する" do
    expect(result).to eq(
      {
        json: [
          {
            userId: "carol",
            name: "Carol",
            score: 2000,
            rankedAt: "2026/02/03",
            rank: 1
          },
          {
            userId: "bob",
            name: "bob",
            score: 2000,
            rankedAt: "2026/02/01",
            rank: 2
          },
          {
            userId: "alice",
            name: "Alice",
            score: 3000,
            rankedAt: "2026/01/31",
            rank: 3
          },
          {
            userId: "",
            name: "NO NAME",
            score: 1500,
            rankedAt: "2026/01/30",
            rank: 4
          }
        ],
        status: :ok
      }
    )
  end
end
