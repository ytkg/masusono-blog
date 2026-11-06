require "rails_helper"

RSpec.describe Microcms::CreateContentService do
  subject(:result) { described_class.execute(endpoint:, attributes:) }

  let(:endpoint) { "https://example.test/api/v1/contents" }
  let(:attributes) { { title: "記事", score: 0 } }
  let(:response_body) { { id: "created-id" }.to_json }

  before do
    stub_microcms_api_key
    stub_request(:post, endpoint)
      .with(headers: microcms_write_request_headers, body: attributes.to_json)
      .to_return(status: 201, body: response_body, headers: json_response_headers)
  end

  it "作成されたIDを返す" do
    expect(result).to eq(id: "created-id")
  end

  [ "", "{", "not-json" ].each do |body|
    context "成功応答のJSONが#{body.inspect}の場合" do
      let(:response_body) { body }

      it "IDなしの結果を返し、重複作成につながる再送をしない" do
        expect(result).to eq(id: nil)
        expect(a_request(:post, endpoint)).to have_been_made.once
      end
    end
  end

  context "成功応答にIDがない場合" do
    let(:response_body) { {}.to_json }

    it { is_expected.to eq(id: nil) }
  end

  context "エラー応答のJSONが壊れている場合" do
    before { stub_request(:post, endpoint).to_return(status: 503, body: "{") }

    it "解析結果で障害を隠さずステータスと応答を保持する" do
      expect { result }.to raise_error(Microcms::FetchContentsService::FetchError) do |error|
        expect(error.status).to eq(503)
        expect(error.body).to eq("{")
      end
    end
  end

  [ [ Net::OpenTimeout, Faraday::ConnectionFailed ], [ Net::ReadTimeout, Faraday::TimeoutError ] ].each do |network_error, expected_error|
    context "送信中に#{network_error}が起きる場合" do
      before { stub_request(:post, endpoint).to_raise(network_error) }

      it "通信障害を伝え、自動再送しない" do
        expect { result }.to raise_error(expected_error)
        expect(a_request(:post, endpoint)).to have_been_made.once
      end
    end
  end
end
