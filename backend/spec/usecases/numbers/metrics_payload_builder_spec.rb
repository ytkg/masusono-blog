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
            },
            {
              label: "平均文字数",
              value: "46 字",
              children: [
                { label: "増田の平均文字数", value: "46 字" },
                { label: "その他の平均文字数", value: "47 字" }
              ]
            }
          ]
        }
      )
    end

    context "平均に端数がある場合" do
      let(:article_summary) do
        {
          totals: { articles: 2, chars: 2_469 },
          author_rows: [ [ "増田", { articles: 2, chars: 2_469 } ] ]
        }
      end

      it "四捨五入して桁区切りで表示する" do
        expect(result[:blocks].last).to eq(
          label: "平均文字数", value: "1,235 字",
          children: [ { label: "増田の平均文字数", value: "1,235 字" } ]
        )
      end
    end

    context "記事数が0件の場合" do
      let(:article_summary) do
        {
          totals: { articles: 0, chars: 0 },
          author_rows: [ [ "増田", { articles: 0, chars: 0 } ] ]
        }
      end

      it "全体と著者別の平均をダッシュで表示する" do
        expect(result[:blocks].last).to eq(
          label: "平均文字数", value: "—",
          children: [ { label: "増田の平均文字数", value: "—" } ]
        )
      end
    end

    context "記事はあるが本文の文字数が0の場合" do
      let(:article_summary) do
        {
          totals: { articles: 1, chars: 0 },
          author_rows: [ [ "増田", { articles: 1, chars: 0 } ] ]
        }
      end

      it "平均を0字で表示する" do
        expect(result[:blocks].last).to eq(
          label: "平均文字数", value: "0 字",
          children: [ { label: "増田の平均文字数", value: "0 字" } ]
        )
      end
    end
  end
end
