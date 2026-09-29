require "rails_helper"

RSpec.describe Microcms::FetchMediaService do
  subject(:result) { described_class.call(query: "cat", page: 2, api_key: "test-key", connection:) }

  let(:connection) { instance_double(Faraday::Connection) }

  it "v2 APIのページをたどって指定ページを返す" do
    first = double(success?: true, body: { media: [ { id: "first" } ], totalCount: 51, token: "next" }.to_json)
    second = double(success?: true, body: { media: [ { id: "second", url: "https://example.com/cat.png", width: 100, height: 80 } ], totalCount: 51, token: "end" }.to_json)
    allow(connection).to receive(:get).and_return(first, second)

    expect(result[:media]).to eq([ { "id" => "second", "url" => "https://example.com/cat.png", "width" => 100, "height" => 80 } ])
    expect(result[:has_more]).to be(false)
  end

  it "異常なページ番号を拒否する" do
    expect { described_class.call(query: "", page: "9999", api_key: "test-key", connection:) }.to raise_error(ArgumentError)
  end
end
