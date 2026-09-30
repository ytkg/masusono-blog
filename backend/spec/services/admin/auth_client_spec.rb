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
end
