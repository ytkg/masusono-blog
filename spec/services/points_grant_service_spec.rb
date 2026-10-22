require "rails_helper"

RSpec.describe PointsGrantService do
  subject(:grant) { described_class.execute(user_id: "cookie-user", amount: amount) }

  let(:amount) { 1234 }
  let(:status) { 200 }

  before do
    stub_request(:post, described_class::ENDPOINT)
      .with(body: { userId: "cookie-user", amount: amount }.to_json, headers: { "Content-Type" => "application/json" })
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
end
