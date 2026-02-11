require "rails_helper"

RSpec.describe Microcms::FetchArticlesService do
  describe ".execute" do
    subject(:result) { described_class.execute }

    let(:endpoint) { described_class::MICROCMS_ARTICLES_ENDPOINT }
    let(:query) { { "limit" => "100", "offset" => "0", "orders" => "-publishedAt" } }
    let(:contents) do
      [
        {
          id: "first",
          publishedAt: "2025-10-05T00:00:00.000Z",
          title: "first title",
          content: "<p>first body</p>",
          author: { name: "増田太郎" }
        }
      ]
    end

    before do
      stub_microcms_get(endpoint:, query:, contents:)
    end

    it do
      expect(result).to eq(contents)
    end

    it do
      expect(described_class::ENDPOINT).to eq(described_class::MICROCMS_ARTICLES_ENDPOINT)
    end
  end
end
