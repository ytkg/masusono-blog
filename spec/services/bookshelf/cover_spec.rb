require "rails_helper"

RSpec.describe Bookshelf::Cover do
  subject(:result) { described_class.call("9784101010014") }

  let(:info) { { industryIdentifiers: [ { type: "ISBN_13", identifier: "9784101010014" } ], imageLinks: { thumbnail: "http://books.google.com/cover?id=test" }, infoLink: "https://books.google.com/books?id=test" } }
  let(:items) { [ { volumeInfo: info, saleInfo: { isEbook: false } } ] }

  before do
    allow(Rails.application.credentials).to receive(:dig).with(:google_books, :api_key).and_return("private-key")
    allow(Rails.application.credentials).to receive(:dig).with(:google_books, :removal_contact_url).and_return("https://example.com/contact")
    stub_request(:get, described_class::ENDPOINT).with(query: { q: "isbn:9784101010014", key: "private-key", maxResults: 10 }).to_return(body: { items: items }.to_json)
  end

  it "only returns the matched edition with attribution URLs and no key" do
    expect(result).to eq(imageUrl: "https://books.google.com/cover?id=test", googleBooksUrl: "https://books.google.com/books?id=test", removalContactUrl: "https://example.com/contact")
  end

  context "ISBN-10 identifier" do
    let(:info) { super().merge(industryIdentifiers: [ { type: "ISBN_10", identifier: "4101010013" } ]) }

    it "accepts the equivalent validated ISBN" do
      expect(result[:googleBooksUrl]).to eq("https://books.google.com/books?id=test")
    end
  end

  context "another edition" do
    let(:info) { super().merge(industryIdentifiers: [ { type: "ISBN_13", identifier: "9780804429573" } ]) }
    it { is_expected.to be_nil }
  end

  context "ebook" do
    let(:items) { [ { volumeInfo: info, saleInfo: { isEbook: true } } ] }
    it { is_expected.to be_nil }
  end

  context "no image" do
    let(:info) { super().except(:imageLinks) }
    it { is_expected.to be_nil }
  end

  it "signals rate limiting so the launch can stop further cover queries" do
    stub_request(:get, described_class::ENDPOINT).with(query: { q: "isbn:9784101010014", key: "private-key", maxResults: 10 }).to_return(status: 429)
    expect { result }.to raise_error(described_class::RateLimited)
  end

  it "does not expose failures" do
    stub_request(:get, described_class::ENDPOINT).with(query: { q: "isbn:9784101010014", key: "private-key", maxResults: 10 }).to_raise(Faraday::TimeoutError)
    expect(result).to be_nil
  end

  it "does not query Google without a rights-holder contact" do
    allow(Rails.application.credentials).to receive(:dig).with(:google_books, :removal_contact_url).and_return(nil)
    expect(result).to be_nil
    expect(a_request(:get, described_class::ENDPOINT)).not_to have_been_made
  end
end
