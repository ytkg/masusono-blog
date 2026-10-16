require "rails_helper"

RSpec.describe RelatedArticlesBuilder do
  subject(:result) { described_class.call(article:) }

  let(:article) { { id: "current", tags: " ラーメン,味玉,ラーメン,価値観 " } }
  let(:candidates) do
    [
      { id: "single", title: "新しい1タグ", tags: "ラーメン", publishedAt: "2026-10-06T12:00:00Z" },
      { id: "both", title: "古い2タグ", tags: "味玉,ラーメン,味玉", publishedAt: "2025-01-01T00:00:00Z" },
      { id: "early", title: "同じ日の早い記事", tags: "味玉", publishedAt: "2026-10-06T01:00:00Z" },
      { id: "excluded", tags: "価値観,感情,自己理解,思い出,お金,節約,おすすめ" },
      { id: "unrelated", tags: "旅行" },
      { id: "no-tags", tags: nil },
      article,
      { id: nil, tags: "ラーメン" }
    ]
  end

  before do
    allow(Article).to receive(:all).and_return(candidates)
  end

  it "タグの設定順で分類し、タグ間の重複を許してIDとタイトルだけ返す" do
    expect(result.pluck(:tag)).to eq(%w[ラーメン 味玉 価値観])
    expect(result[0][:articles]).to match_array(candidates.first(2).map { |item| item.slice(:id, :title) })
    expect(result[1][:articles]).to match_array(candidates.values_at(1, 2).map { |item| item.slice(:id, :title) })
    expect(result[2][:articles]).to eq([ { id: "excluded" } ])
  end

  context "候補が4件以上の場合" do
    let(:candidates) do
      items = 8.times.map { |i| { id: i.to_s, title: i.to_s, tags: "味玉" } }
      items + [ items.first, article, { id: nil, tags: "味玉" } ]
    end

    it "重複せず最大3件をランダムに選ぶ" do
      selections = 10.times.map { described_class.call(article:).first[:articles].pluck(:id) }
      expect(selections).to all(satisfy { |ids| ids.size == 3 && ids.uniq == ids && (ids - (0...8).map(&:to_s)).empty? })
      expect(selections.uniq.size).to be > 1
    end
  end

  context "対象タグがない場合" do
    [ nil, " , , " ].each do |tags|
      context "タグが#{tags.inspect}の場合" do
        let(:article) { { id: "current", tags: } }

        it "追加取得も表示もしない" do
          expect(result).to eq([])
          expect(Article).not_to have_received(:all)
        end
      end
    end
  end

  context "一致する候補がない場合" do
    let(:candidates) { [ article, { id: "other", tags: "ラーメン好き" } ] }

    it "完全一致以外や閲覧中の記事で埋めない" do
      expect(result).to eq([])
    end
  end

  it "公開記事の削除やタグ変更を次の取得で反映する" do
    described_class.call(article:)
    allow(Article).to receive(:all).and_return([ { id: "single", tags: "旅行" } ])
    expect(result).to eq([])
  end

  context "公開記事が1件だけ一致する場合" do
    let(:candidates) { [ { id: "only", title: "1件", tags: "味玉" } ] }

    it "1件だけ返す" do
      expect(result).to eq([ { tag: "味玉", articles: [ { id: "only", title: "1件" } ] } ])
    end
  end

  [ Faraday::TimeoutError, JSON::ParserError ].each do |error_class|
    context "#{error_class}が発生した場合" do
      before do
        allow(Article).to receive(:all).and_raise(error_class)
        allow(Rails.logger).to receive(:warn)
      end

      it "候補を表示せず秘密情報を含めないログを残す" do
        expect(result).to eq([])
        expect(Rails.logger).to have_received(:warn).with("Related articles fetch failed: #{error_class.name}")
      end
    end
  end
end
