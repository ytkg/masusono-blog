require "rails_helper"

RSpec.describe Api::App::Users::ShowUsecase do
  subject(:result) { described_class.call(user_id: user_id) }

  let(:user_id) { "cookie-user" }
  let(:user_response) { { name: "表示名太郎" } }

  before do
    allow(Microcms::Users::FetchByUserIdService).to receive(:execute).and_return(user_response)
  end

  it do
    expect(result).to eq(
      {
        json: {
          userId: "cookie-user",
          name: "表示名太郎"
        }
      }
    )
  end

  context "ユーザーが見つからない場合" do
    let(:user_response) { {} }

    it do
      expect(result).to eq(
        {
          json: {
            userId: "cookie-user",
            name: nil
          }
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

  [ 123, true, false, [], {} ].each do |value|
    context "user_idが文字列でない#{value.inspect}の場合" do
      let(:user_id) { value }

      it "外部処理を呼ばず拒否する" do
        expect { result }.to raise_error(ArgumentError, "user_id must be a string")
        expect(Microcms::Users::FetchByUserIdService).not_to have_received(:execute)
      end
    end
  end
end
