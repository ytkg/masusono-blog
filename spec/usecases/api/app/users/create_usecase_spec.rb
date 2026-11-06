require "rails_helper"

RSpec.describe Api::App::Users::CreateUsecase do
  subject(:result) { described_class.call(name: name, user_id: user_id) }

  let(:name) { "表示名太郎" }
  let(:user_id) { "cookie-user" }
  let(:content_id) { "u-e329d2ee785ead849d97f03f875fd338" }

  before do
    allow(Microcms::Users::UpsertByContentIdService).to receive(:execute)
  end

  it do
    expect(result).to eq(
      {
        json: {
          id: "u-e329d2ee785ead849d97f03f875fd338",
          userId: "cookie-user",
          name: "表示名太郎"
        }
      }
    )
  end

  it "正規コンテンツIDへユーザー情報を保存する" do
    result

    expect(Microcms::Users::UpsertByContentIdService).to have_received(:execute).with(
      content_id: content_id,
      user_id: "cookie-user",
      name: "表示名太郎"
    )
  end

  context "user_idに前後空白がある場合" do
    let(:user_id) { " cookie-user " }

    it "正規化した値で保存・応答する" do
      expect(result.dig(:json, :userId)).to eq("cookie-user")
      expect(Microcms::Users::UpsertByContentIdService).to have_received(:execute).with(
        content_id: content_id,
        user_id: "cookie-user",
        name: "表示名太郎"
      )
    end
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

  [ 123, true, false, [], {} ].each do |value|
    context "user_idが文字列でない#{value.inspect}の場合" do
      let(:user_id) { value }

      it "外部処理を呼ばず拒否する" do
        expect { result }.to raise_error(ArgumentError, "user_id must be a string")
        expect(Microcms::Users::UpsertByContentIdService).not_to have_received(:execute)
      end
    end
  end


  [ 123, true, false, [], {} ].each do |value|
    context "nameが文字列でない#{value.inspect}の場合" do
      let(:name) { value }

      it "外部処理を呼ばず拒否する" do
        expect { result }.to raise_error(ArgumentError, "name must be a string")
        expect(Microcms::Users::UpsertByContentIdService).not_to have_received(:execute)
      end
    end
  end
end
