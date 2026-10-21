require "rails_helper"

RSpec.describe Bookshelf::Catalog do
  subject(:result) { described_class.call }

  let(:first) { { isbn: "9784101010014", amazonUrl: "https://www.amazon.co.jp/dp/4101010013", appearances: { "old" => { id: "old", title: "初登場", publishedAt: "2026-01-01T00:00:00Z", time: Time.iso8601("2026-01-01T00:00:00Z") }, "new" => { id: "new", title: "再登場", publishedAt: "2026-02-01T00:00:00Z", time: Time.iso8601("2026-02-01T00:00:00Z") } } } }

  before do
    stub_const("Bookshelf::Catalog::BATCH_SIZE", 1)
    allow(Article).to receive(:all).and_return([])
    allow(Bookshelf::Candidates).to receive(:call).and_return([ first, { isbn: "9780804429573" }, { isbn: "9784101010021" } ])
    stub_request(:get, described_class::ENDPOINT).with(query: { isbn: "9784101010014" }).to_return(body: [ { summary: { isbn: "9784101010014", title: "書名", author: "著者" } } ].to_json)
    stub_request(:get, described_class::ENDPOINT).with(query: { isbn: "9780804429573" }).to_return(status: 429)
  end

  it "keeps successful books, sorts articles newest first, and stops after a failure" do
    expect(result[:partial]).to be(true)
    expect(result[:books].sole[:articles].pluck(:id)).to eq(%w[new old])
    expect(a_request(:get, described_class::ENDPOINT).with(query: { isbn: "9784101010021" })).not_to have_been_made
  end
end
