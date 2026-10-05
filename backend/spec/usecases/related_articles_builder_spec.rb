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

  it "共通タグ数を優先し、公開時刻順に最大3件のタイトルとIDを返す" do
    expect(result).to eq([
      { id: "both", title: "古い2タグ" },
      { id: "single", title: "新しい1タグ" },
      { id: "early", title: "同じ日の早い記事" }
    ])
  end

  context "同点・日付欠損・重複がある場合" do
    let(:candidates) do
      [
        { id: "b", tags: "味玉", publishedAt: "2026-01-01T00:00:00Z" },
        { id: "missing-b", tags: "味玉" },
        { id: "a", tags: "味玉", publishedAt: "2026-01-01T09:00:00+09:00" },
        { id: "a", tags: "味玉", publishedAt: "2026-01-01T09:00:00+09:00" },
        { id: "missing-a", tags: "味玉", publishedAt: "invalid" }
      ]
    end

    it "同じ日時はID順にし、日付欠損を末尾に置き、IDを重複させない" do
      expect(result.pluck(:id)).to eq(%w[a b missing-a])
    end
  end

  context "対象タグがない場合" do
    [ nil, " , , ", "価値観,感情,自己理解,思い出,お金,節約,おすすめ" ].each do |tags|
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
    let(:candidates) { [ article, { id: "other", tags: "ラーメン好き,価値観" } ] }

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
      expect(result).to eq([ { id: "only", title: "1件" } ])
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
