require "rails_helper"

RSpec.describe YearAgoArticlesBuilder do
  subject(:result) { described_class.call(article:) }

  let(:article) { { id: "current", publishedAt: "2026-01-14T15:00:00.000Z" } }
  let(:filters) { "publishedAt[greater_than]2025-01-14T14:59:59.999Z[and]publishedAt[less_than]2025-01-15T15:00:00.000Z" }
  let(:candidates) do
    [
      { id: "midnight", title: "午前0時", publishedAt: "2025-01-14T15:00:00.000Z" },
      { id: "before", title: "前日", publishedAt: "2025-01-14T14:59:59.999Z" },
      { id: "last", title: "日付の終わり", publishedAt: "2025-01-15T14:59:59.999Z" },
      { id: "next", title: "翌日", publishedAt: "2025-01-15T15:00:00.000Z" },
      { id: "noon", title: "昼", publishedAt: "2025-01-15T03:00:00.000Z" },
      { id: "evening", title: "夕方", publishedAt: "2025-01-15T09:00:00.000Z" },
      { id: "noon", title: "重複", publishedAt: "2025-01-15T03:00:00.000Z" },
      { id: "invalid", publishedAt: "invalid" },
      { id: nil, publishedAt: "2025-01-15T03:00:00.000Z" },
      { id: "current", publishedAt: "2025-01-15T03:00:00.000Z" }
    ]
  end

  before do
    allow(Article).to receive(:fetch_by_filter).with(filters).and_return(candidates)
  end

  it "JSTの前年同日だけを、件数制限なしで新しい順に返す" do
    expect(result).to eq([
      { id: "last", title: "日付の終わり" },
      { id: "evening", title: "夕方" },
      { id: "noon", title: "昼" },
      { id: "midnight", title: "午前0時" }
    ])
  end

  context "同日の記事がない場合" do
    let(:candidates) { [] }

    it { is_expected.to eq([]) }
  end

  context "公開日が2月29日の場合" do
    let(:article) { { publishedAt: "2024-02-28T15:00:00Z" } }

    it "別の日に丸めず、取得もしない" do
      expect(Article).not_to receive(:fetch_by_filter)
      expect(result).to eq([])
    end
  end

  context "公開日が不正な場合" do
    let(:article) { { publishedAt: "invalid" } }

    it { is_expected.to eq([]) }
  end

  context "公開日がない場合" do
    let(:article) { {} }

    it { is_expected.to eq([]) }
  end

  context "年をまたぐ場合" do
    let(:article) { { publishedAt: "2025-12-31T15:00:00Z" } }
    let(:filters) { "publishedAt[greater_than]2024-12-31T14:59:59.999Z[and]publishedAt[less_than]2025-01-01T15:00:00.000Z" }
    let(:candidates) { [ { id: "new-year", title: "元日", publishedAt: "2024-12-31T15:00:00Z" } ] }

    it { is_expected.to eq([ { id: "new-year", title: "元日" } ]) }
  end

  [ Microcms::FetchContentsService::FetchError.new(status: 503, body: "unavailable"),
    Faraday::TimeoutError.new, JSON::ParserError.new ].each do |error|
    context "#{error.class}が発生した場合" do
      before { allow(Article).to receive(:fetch_by_filter).with(filters).and_raise(error) }

      it { is_expected.to eq([]) }
    end
  end
end
