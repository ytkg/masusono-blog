require "rails_helper"

RSpec.describe CalendarArticlesUsecase do
  subject(:result) { described_class.call }

  let(:articles) { [ { id: "source" } ] }
  let(:payloads) { [] }

  before do
    allow(Article).to receive(:all).and_return(articles)
    allow(ArticlePayloadBuilder).to receive(:collection).with(articles).and_return(payloads)
  end

  it "記事がない場合も空のgroupsを返す" do
    expect(result).to eq(json: { groups: [] })
  end

  context "複数年・複数月の記事がある場合" do
    let(:payloads) do
      [
        { id: "december", publishedDate: "2026/12/31" },
        { id: "new", publishedDate: "2026/01/01" },
        { id: "leap", publishedDate: "2024/02/29" },
        { id: "old", publishedDate: "2025/01/01" }
      ]
    end

    it "月日で昇順にまとめ、同日の記事順とペイロードを維持する" do
      expect(result).to eq(json: { groups: [
        { monthDay: "01/01", articles: payloads.values_at(1, 3) },
        { monthDay: "02/29", articles: [ payloads[2] ] },
        { monthDay: "12/31", articles: [ payloads[0] ] }
      ] })
    end
  end

  [ nil, 20260101, [], {}, "", "2026/1/01", "2026/01/1", "2026-01-01", "2026/01/01extra",
    "2026/00/01", "2026/13/01", "2026/01/00", "2026/04/31", "1900/02/29" ].each do |date|
    context "公開日が#{date.inspect}の場合" do
      let(:payloads) { [ { id: "invalid", publishedDate: date }, { id: "valid", publishedDate: "2000/02/29" } ] }

      it "不正な記事だけを除外し、閏世紀の日付は残す" do
        expect(result).to eq(json: { groups: [ { monthDay: "02/29", articles: [ payloads.last ] } ] })
      end
    end
  end
end
