require "rails_helper"

RSpec.describe Microcms::FetchMediaService do
  subject(:result) { described_class.call(query: "cat", page: 2, api_key: "test-key", connection:) }

  let(:connection) { instance_double(Faraday::Connection) }

  it "v2 APIのページをたどって指定ページを返す" do
    first = double(success?: true, body: { media: [ { id: "first" } ], totalCount: 21, token: "next" }.to_json)
    second = double(success?: true, body: { media: [ { id: "second", url: "https://example.com/cat.png", width: 100, height: 80 } ], totalCount: 21, token: "end" }.to_json)
    allow(connection).to receive(:get).and_return(first, second)

    expect(result[:media]).to eq([ { "id" => "second", "url" => "https://example.com/cat.png", "width" => 100, "height" => 80 } ])
    expect(result[:has_more]).to be(false)
    expect(connection).to have_received(:get).with("api/v2/media", { limit: 20, fileName: "cat" })
    expect(connection).to have_received(:get).with("api/v2/media", { token: "next" })
  end

  it "追加読み込みで前回のtokenを直接使う" do
    response = double(success?: true, body: { media: [ { id: "second" } ], totalCount: 41, token: "next" }.to_json)
    allow(connection).to receive(:get).with("api/v2/media", { token: "cursor" }).and_return(response)

    page = described_class.call(query: "cat", page: 2, cursor: "cursor", api_key: "test-key", connection:)

    expect(page[:media]).to eq([ { "id" => "second" } ])
    expect(page[:next_token]).to eq("next")
    expect(page[:has_more]).to be(true)
  end

  it "期限切れtokenは最初からたどり直す" do
    expired = double(success?: false, status: 400)
    first = double(success?: true, body: { media: [], totalCount: 21, token: "fresh" }.to_json)
    second = double(success?: true, body: { media: [ { id: "second" } ], totalCount: 21, token: "end" }.to_json)
    allow(connection).to receive(:get).and_return(expired, first, second)

    page = described_class.call(query: "cat", page: 2, cursor: "expired", api_key: "test-key", connection:)

    expect(page[:media]).to eq([ { "id" => "second" } ])
    expect(connection).to have_received(:get).exactly(3).times
  end

  it "異常なページ番号を拒否する" do
    expect { described_class.call(query: "", page: "9999", api_key: "test-key", connection:) }.to raise_error(ArgumentError)
  end
end
