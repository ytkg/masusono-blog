require "rails_helper"

RSpec.describe Api::App::MasudaRun::RankingsCreateUsecase do
  subject(:result) { described_class.call(score: score, user_id: user_id) }

  let(:score) { 1234 }
  let(:user_id) { "cookie-user" }

  before do
    allow(Microcms::MasudaRun::CreateRankingService).to receive(:execute).and_return({ id: "new-ranking-id" })
  end

  it do
    expect(result).to eq(
      {
        json: {
          id: "new-ranking-id",
          userId: "cookie-user",
          score: 1234
        },
        status: :created
      }
    )
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
