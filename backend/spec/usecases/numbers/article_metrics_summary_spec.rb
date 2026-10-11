require "rails_helper"

RSpec.describe Numbers::ArticleMetricsSummary do
  subject(:result) { described_class.call(articles:, character_counter:) }

  let(:articles) do
    [ { author: { name: " 増田 " }, count: 2 }, { author: "増田", count: 3 },
      { author: nil, count: 4 }, { author: "  ", count: 1 } ]
  end
  let(:character_counter) { ->(article) { article.fetch(:count) } }

  it "groups normalized and missing author names using the provided counter" do
    original = Marshal.load(Marshal.dump(articles))
    expect(result[:totals]).to eq(articles: 4, chars: 10,
      authors: { "増田" => { articles: 2, chars: 5 }, "不明" => { articles: 2, chars: 5 } })
    expect(result[:author_rows].map(&:first)).to eq([ "増田", "不明" ])
    expect(articles).to eq(original)
  end
end
