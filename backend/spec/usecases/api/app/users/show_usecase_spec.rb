require "rails_helper"

RSpec.describe Api::App::Users::ShowUsecase do
  subject(:result) { described_class.call(user_id: user_id) }

  let(:user_id) { "cookie-user" }

  before do
    allow(Microcms::Users::FetchByUserIdService).to receive(:execute).and_return({ name: "表示名太郎" })
  end

  it do
    expect(result).to eq(
      {
        json: {
          userId: "cookie-user",
          name: "表示名太郎"
        },
        status: :ok
      }
    )
  end

  context "ユーザーが見つからない場合" do
    before do
      allow(Microcms::Users::FetchByUserIdService).to receive(:execute).and_return({})
    end

    it do
      expect(result).to eq(
        {
          json: {
            userId: "cookie-user",
            name: nil
          },
          status: :ok
        }
      )
    end
  end

  context "user_idが空の場合" do
    let(:user_id) { "" }

    it do
      expect { result }.to raise_error(ArgumentError, "user_id is required")
    end
  end
end
