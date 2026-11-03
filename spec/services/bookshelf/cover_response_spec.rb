require "rails_helper"

RSpec.describe Bookshelf::Cover do
  subject(:result) { described_class.call("9784101010014") }

  let(:status) { 200 }
  let(:payload) { { items: [] } }

  before do
    allow(Rails.application.credentials).to receive(:dig).with(:google_books, :api_key).and_return("test-key")
    allow(Rails.application.credentials).to receive(:dig).with(:google_books, :removal_contact_url).and_return("https://example.test/contact")
    stub_request(:get, described_class::ENDPOINT)
      .with(query: { q: "isbn:9784101010014", key: "test-key", maxResults: 10 })
      .to_return(status:, body: payload.to_json)
  end

  context "上流が503の場合" do
    let(:status) { 503 }
    it { is_expected.to be_nil }
  end

  [ [], { items: nil }, { items: [ nil, "invalid", {}, { volumeInfo: [] } ] } ].each do |body|
    context "応答の形が#{body.inspect}の場合" do
      let(:payload) { body }
      it "壊れた書影を表示せず、ほかの本の表示を妨げない" do
        expect(result).to be_nil
      end
    end
  end
end
