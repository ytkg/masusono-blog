require "rails_helper"

RSpec.describe Admin::AuthenticatedSession do
  include ActiveSupport::Testing::TimeHelpers
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

  it "リフレッシュトークンが拒否されたらセッションを破棄する" do
    allow(client).to receive(:verify).and_return(false)
    allow(client).to receive(:refresh).and_return(nil)

    expect(described_class.valid?(session:, client:)).to be(false)
    expect(session).not_to have_key(:admin_auth)
  end

  it "更新後のアクセストークンも無効ならセッションを破棄する" do
    allow(client).to receive(:verify).and_return(false)
    allow(client).to receive(:refresh).and_return("access_token" => "invalid", "refresh_token" => "refresh")

    expect(described_class.valid?(session:, client:)).to be(false)
    expect(session).not_to have_key(:admin_auth)
  end

  it "開始時点から7日間の有効期限を設定する" do
    freeze_time do
      tokens = { "access_token" => "access", "refresh_token" => "refresh" }
      described_class.start(session:, tokens:)

      expect(session[:admin_auth]).to eq(tokens.merge("expires_at" => 7.days.from_now.to_i))
      expect(tokens).not_to have_key("expires_at")
    end
  end

  [ nil, "invalid", [] ].each do |auth|
    it "Hashでない認証情報#{auth.inspect}では外部認証を行わない" do
      session[:admin_auth] = auth
      expect(client).not_to receive(:verify)
      expect(client).not_to receive(:refresh)

      expect(described_class.valid?(session:, client:)).to be(false)
    end
  end

  it "有効期限と同じ時刻には外部認証を行わず破棄する" do
    freeze_time do
      session[:admin_auth]["expires_at"] = Time.current.to_i
      expect(client).not_to receive(:verify)
      expect(client).not_to receive(:refresh)

      expect(described_class.valid?(session:, client:)).to be(false)
      expect(session).not_to have_key(:admin_auth)
    end
  end

  it "有効期限の1秒前は認証でき、更新せず期限も延長しない" do
    freeze_time do
      session[:admin_auth]["expires_at"] = 1.second.from_now.to_i
      original = session[:admin_auth].dup
      allow(client).to receive(:verify).with(access_token: "expired").and_return(true)
      expect(client).not_to receive(:refresh)

      expect(described_class.valid?(session:, client:)).to be(true)
      expect(session[:admin_auth]).to eq(original)
    end
  end

  it "トークンを更新してもセッション開始時の期限を維持する" do
    original_expiry = session[:admin_auth]["expires_at"]
    allow(client).to receive(:verify).with(access_token: "expired").and_return(false)
    allow(client).to receive(:verify).with(access_token: "new-access").and_return(true)
    allow(client).to receive(:refresh).with(refresh_token: "refresh").and_return(
      "access_token" => "new-access", "refresh_token" => "new-refresh"
    )

    travel 1.day do
      expect(described_class.valid?(session:, client:)).to be(true)
      expect(session[:admin_auth]).to eq(
        "access_token" => "new-access", "refresh_token" => "new-refresh", "expires_at" => original_expiry
      )
    end
  end

  it "期限のないセッションを認証済みとして扱わない" do
    session[:admin_auth].delete("expires_at")
    expect(client).not_to receive(:verify)

    expect(described_class.valid?(session:, client:)).to be(false)
    expect(session).not_to have_key(:admin_auth)
  end
end
