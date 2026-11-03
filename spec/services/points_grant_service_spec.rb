require "rails_helper"

RSpec.describe PointsGrantService do
  subject(:grant) { described_class.execute(user_id: user_id, amount: amount) }

  let(:user_id) { "cookie-user" }
  let(:amount) { 1234 }
  let(:status) { 200 }

  before do
    stub_request(:post, described_class::ENDPOINT)
      .with(body: { userId: user_id, amount: amount }.to_json, headers: { "Content-Type" => "application/json" })
      .to_return(status: status, body: '{"userId":"cookie-user","pointBalance":1234}')
  end

  it "指定したユーザーへポイントを付与する" do
    expect(grant).to be_nil
    expect(a_request(:post, described_class::ENDPOINT)).to have_been_made.once
  end

  [ 400, 409, 503 ].each do |failure_status|
    context "HTTP #{failure_status}の場合" do
      let(:status) { failure_status }

      it "再送せずエラーを返す" do
        expect { grant }.to raise_error(described_class::Error, "Points grant failed (status=#{failure_status})")
        expect(a_request(:post, described_class::ENDPOINT)).to have_been_made.once
      end
    end
  end

  [ Faraday::TimeoutError, Faraday::ConnectionFailed ].each do |error_class|
    it "#{error_class}を再送せずサービスのエラーに変換する" do
      stub_request(:post, described_class::ENDPOINT).to_raise(error_class)

      expect { grant }.to raise_error(described_class::Error)
      expect(a_request(:post, described_class::ENDPOINT)).to have_been_made.once
    end
  end

  [ 0, -1, 1.5, 9_007_199_254_740_992 ].each do |invalid_amount|
    context "amountが#{invalid_amount}の場合" do
      let(:amount) { invalid_amount }

      it "リクエストせずエラーを返す" do
        expect { grant }.to raise_error(described_class::Error, "amount must be a positive safe integer")
        expect(a_request(:post, described_class::ENDPOINT)).not_to have_been_made
      end
    end
  end
  [ nil, 123, "", " ", "x" * 201 ].each do |invalid_user_id|
    context "user_idが#{invalid_user_id.inspect}の場合" do
      let(:user_id) { invalid_user_id }

      it "外部へ送信せず拒否する" do
        expect { grant }.to raise_error(described_class::Error, "user_id must contain 1 to 200 characters")
        expect(a_request(:post, described_class::ENDPOINT)).not_to have_been_made
      end
    end
  end

  [ 1, 9_007_199_254_740_991 ].each do |boundary_amount|
    context "amountが許容範囲の端#{boundary_amount}の場合" do
      let(:amount) { boundary_amount }
      let(:user_id) { "x" * 200 }

      it "200文字のユーザーIDと金額を変えずに送信する" do
        expect(grant).to be_nil
        expect(a_request(:post, described_class::ENDPOINT)).to have_been_made.once
      end
    end
  end
end
