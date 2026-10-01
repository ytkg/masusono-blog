require "rails_helper"

RSpec.describe Microcms::FetchManagedArticlesService do
  subject(:result) { described_class.call(query:, status:, page:, api_key: "test-key", connection:) }

  let(:connection) { instance_double(Faraday::Connection) }
  let(:query) { "下書き" }
  let(:status) { "all" }
  let(:page) { 1 }

  it "下書き側のタイトルで全件を検索し、更新日時の降順で返す" do
    management = double(success?: true, body: {
      contents: [
        { id: "published", status: [ "PUBLISH" ], updatedAt: "2026-01-01T00:00:00Z" },
        { id: "draft", status: [ "PUBLISH_AND_DRAFT" ], updatedAt: "2026-02-01T00:00:00Z" }
      ], totalCount: 2, limit: 100, offset: 0
    }.to_json)
    content = double(success?: true, body: {
      contents: [ { id: "published", title: "公開タイトル" }, { id: "draft", title: "下書きの新タイトル" } ], totalCount: 2, limit: 100, offset: 0
    }.to_json)
    allow(connection).to receive(:get).and_return(content, management)

    expect(result).to include(
      articles: [ { id: "draft", title: "下書きの新タイトル", status: "PUBLISH_AND_DRAFT", updated_at: "2026-02-01T00:00:00Z" } ],
      total_count: 1,
      has_more: false
    )
    expect(connection).to have_received(:get).with(described_class::CONTENT_ENDPOINT, { limit: 100, offset: 0, fields: "id,title" })
    expect(connection).to have_received(:get).with(described_class::MANAGEMENT_ENDPOINT, { limit: 100, offset: 0 })
  end

  it "状態の絞り込みと20件ごとのページングを全件に適用する" do
    management = (1..21).map do |number|
      { id: "article-#{number}", status: [ "DRAFT" ], updatedAt: format("2026-01-%02dT00:00:00Z", number) }
    end
    content = (1..21).map { |number| { id: "article-#{number}", title: "記事#{number}" } }
    allow(connection).to receive(:get).and_return(
      double(success?: true, body: { contents: content, totalCount: 21, limit: 100, offset: 0 }.to_json),
      double(success?: true, body: { contents: management, totalCount: 21, limit: 100, offset: 0 }.to_json)
    )

    page = described_class.call(query: "", status: "draft", page: 2, api_key: "test-key", connection:)

    expect(page).to include(total_count: 21, has_more: false, page: 2)
    expect(page[:articles]).to eq([ { id: "article-1", title: "記事1", status: "DRAFT", updated_at: "2026-01-01T00:00:00Z" } ])
  end

  it "不正な状態を拒否する" do
    expect { described_class.call(query: "", status: "unknown", page: 1, api_key: "test-key", connection:) }.to raise_error(ArgumentError)
  end
end
