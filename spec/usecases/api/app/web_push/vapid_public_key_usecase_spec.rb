require "rails_helper"

RSpec.describe Api::App::WebPush::VapidPublicKeyUsecase do
  subject(:result) { described_class.call }

  [ nil, " " ].each do |key|
    context "公開鍵が#{key.inspect}の場合" do
      before do
        allow(Rails.application.credentials).to receive(:dig).with(:web_push, :vapid_public_key).and_return(key)
      end

      it "空の公開鍵を成功応答として返さない" do
        expect { result }.to raise_error(RuntimeError, "web_push.vapid_public_key is missing")
      end
    end
  end
end
