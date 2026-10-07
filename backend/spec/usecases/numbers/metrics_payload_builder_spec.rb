require "rails_helper"

RSpec.describe Numbers::MetricsPayloadBuilder do
  include ActiveSupport::Testing::TimeHelpers

  describe ".call" do
    subject(:result) { described_class.call(article_summary:) }

    let(:article_summary) do
      {
        totals: { articles: 1_234, chars: 56_789 },
        author_rows: [ [ "増田", { articles: 1_000, chars: 45_678 } ], [ "その他", { articles: 234, chars: 11_111 } ] ]
      }
    end

    before do
      travel_to(Time.iso8601("2025-10-05T15:00:00Z"))
    end

    after { travel_back }

    it do
      expect(result).to eq(
        {
          blocks: [
            { label: "増田とその他！始動から（2025/10/05〜）", value: "1 日" },
            {
              label: "総記事数",
              value: "1,234 本",
              children: [
                { label: "増田の総記事数", value: "1,000 本" },
                { label: "その他の総記事数", value: "234 本" }
              ]
            },
            {
              label: "総文字数",
              value: "56,789 字",
              children: [
                { label: "増田の総文字数", value: "45,678 字" },
                { label: "その他の総文字数", value: "11,111 字" }
              ]
            }
          ]
        }
      )
    end
  end
end
