require "rails_helper"

RSpec.describe Admin::AuthClient do
  let(:connection) { instance_double(Faraday::Connection) }
  subject(:client) { described_class.new(connection:) }

  it "ログインで返されたトークンだけを取り出す" do
    allow(connection).to receive(:post).and_return(double(status: 200, body: '{"accessToken":"access","refreshToken":"refresh","expiresIn":900}'))

    expect(client.login(username: "owner", password: "correct")).to eq(
      "access_token" => "access", "refresh_token" => "refresh"
    )
  end

  it "無効な認証情報を拒否する" do
    allow(connection).to receive(:post).and_return(double(status: 401))

    expect(client.login(username: "owner", password: "wrong")).to be_nil
  end

  context "HTTPで認証サービスに接続するとき" do
    subject(:client) { described_class.new }

    describe "トークンの更新" do
      it "refreshTokenをJSONで送り、旧形式のtokenも受け取れる" do
        stub_request(:post, "#{described_class::BASE_URL}refresh")
          .with(headers: { "Content-Type" => "application/json", "Accept" => "application/json" }, body: { refreshToken: "refresh" }.to_json)
          .to_return(status: 200, body: { token: "new-access", refreshToken: "new-refresh" }.to_json)

        expect(client.refresh(refresh_token: "refresh")).to eq("access_token" => "new-access", "refresh_token" => "new-refresh")
      end
    end

    describe "アクセストークンの検証" do
      { 200 => true, 401 => false }.each do |status, valid|
        it "HTTP #{status}なら#{valid}を返す" do
          stub_request(:get, "#{described_class::BASE_URL}verify")
            .with(headers: { "Authorization" => "Bearer access" }).to_return(status:)

          expect(client.verify(access_token: "access")).to eq(valid)
        end
      end

      it "サービス障害を認証エラーとして伝える" do
        stub_request(:get, "#{described_class::BASE_URL}verify").to_return(status: 503)

        expect { client.verify(access_token: "access") }.to raise_error(described_class::Error, "Authentication service is unavailable")
      end

      it "通信エラーの原因を保持する" do
        stub_request(:get, "#{described_class::BASE_URL}verify").to_timeout

        expect { client.verify(access_token: "access") }.to raise_error(described_class::Error) { |error|
          expect(error.cause).to be_a(Faraday::Error)
        }
      end
    end

    describe "ログイン応答の検証" do
      it "サービス障害を認証エラーとして伝える" do
        stub_request(:post, "#{described_class::BASE_URL}login").to_return(status: 503)

        expect { client.login(username: "owner", password: "password") }.to raise_error(described_class::Error, "Authentication service is unavailable")
      end

      [ "invalid json", { accessToken: "access" }.to_json, { accessToken: 123, refreshToken: "refresh" }.to_json,
        { accessToken: "access", refreshToken: " " }.to_json ].each do |body|
        it "不正なトークン応答#{body.inspect}を拒否する" do
          stub_request(:post, "#{described_class::BASE_URL}login").to_return(status: 200, body:)

          expect { client.login(username: "owner", password: "password") }.to raise_error(described_class::Error, "Invalid authentication response")
        end
      end
    end
  end
end
