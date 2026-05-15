require "rails_helper"

RSpec.describe Microcms::FetchAuthorsService do
  describe ".execute" do
    subject(:result) { described_class.execute }

    let(:endpoint) { described_class::ENDPOINT }
    let(:query) { { "limit" => "100", "offset" => "0", "orders" => "publishedAt" } }
    let(:contents) do
      [
        {
          id: "9wgrey2lh3",
          name: "増田",
          title: "友達と行事に全力で参加する人",
          bio: "プロフィール本文"
        }
      ]
    end

    before do
      stub_microcms_get(endpoint:, query:, contents:)
    end

    it do
      expect(result).to eq(contents)
    end
  end
end
