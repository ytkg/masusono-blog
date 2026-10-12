require "rails_helper"

RSpec.describe Admin::AuthenticatedSession do
  let(:client) { instance_double(Admin::AuthClient) }
  let(:session) { {} }

  before do
    described_class.start(session:, tokens: { "access_token" => "expired", "refresh_token" => "refresh" })
  end

  it "期限切れアクセストークンを更新して認証を維持する" do
    allow(client).to receive(:verify).and_return(false, true)
    allow(client).to receive(:refresh).with(refresh_token: "refresh").and_return(
      { "access_token" => "new-access", "refresh_token" => "new-refresh" }
    )

    expect(described_class.valid?(session:, client:)).to be(true)
    expect(session.dig(:admin_auth, "access_token")).to eq("new-access")
  end

  it "7日を過ぎたセッションを破棄する" do
    session[:admin_auth]["expires_at"] = 1.hour.ago.to_i

    expect(described_class.valid?(session:, client:)).to be(false)
    expect(session[:admin_auth]).to be_nil
  end
end
