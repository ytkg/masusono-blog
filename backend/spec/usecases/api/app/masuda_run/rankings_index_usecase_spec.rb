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
  let(:users_by_id) do
    {
      "carol" => { name: "Carol" },
      "bob" => {},
      "alice" => { name: "Alice" }
    }
  end

  before do
    allow(MasudaRunRanking).to receive(:all).with(limit: described_class::RANKINGS_LIMIT).and_return(rankings)
    allow(Microcms::Users::FetchByUserIdsService).to receive(:execute).and_return(users_by_id)
  end

  it "取得順にrankを付け、表示名とrankedAtを整形する" do
    expect(Microcms::Users::FetchByUserIdsService).to receive(:execute).with(user_ids: [ "carol", "bob", "alice", "" ])

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
