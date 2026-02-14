require "rails_helper"

RSpec.describe Api::App::Users::CreateUsecase do
  subject(:result) { described_class.call(name: name, user_id: user_id) }

  let(:name) { "表示名太郎" }
  let(:user_id) { "cookie-user" }

  before do
    allow(Microcms::Users::CreateService).to receive(:execute).and_return({ id: "new-user-id" })
  end

  it do
    expect(result).to eq(
      {
        json: {
          id: "new-user-id",
          userId: "cookie-user",
          name: "表示名太郎"
        },
        status: :created
      }
    )
  end

  context "nameが空の場合" do
    let(:name) { "  " }

    it do
      expect { result }.to raise_error(ArgumentError, "name is required")
    end
  end

  context "user_idが空の場合" do
    let(:user_id) { "" }

    it do
      expect { result }.to raise_error(ArgumentError, "user_id is required")
    end
  end
end
