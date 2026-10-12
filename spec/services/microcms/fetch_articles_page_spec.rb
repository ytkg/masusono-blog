require "rails_helper"

RSpec.describe Microcms::FetchArticlesService do
  describe ".page" do
    subject(:result) { described_class.page(limit: 10, offset: 10) }

    let(:contents) { [ { id: "next", content: "<p>本文</p>" } ] }
    let(:total_count) { 128 }
    let(:response_limit) { 10 }

    before do
      stub_microcms_get(endpoint: described_class::ENDPOINT,
                        query: { limit: "10", offset: "10", orders: "-publishedAt" },
                        contents:, total_count:, limit: response_limit, offset: 10)
    end

    it "未取得のページがあっても1ページだけ返す" do
      expect(result).to eq(contents:, total_count:)
    end

    context "upstreamのページ情報が不正" do
      let(:response_limit) { 0 }

      it "成功として扱わず取得エラーにする" do
        expect { result }.to raise_error(Microcms::FetchContentsService::FetchError)
      end
    end
  end
end
