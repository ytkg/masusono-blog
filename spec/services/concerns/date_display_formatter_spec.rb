require "rails_helper"

RSpec.describe DateDisplayFormatter do
  describe ".format" do
    it "ISO形式の日時をJSTの日付でYYYY/MM/DDへ整形する" do
      expect(described_class.format("2026-02-23T12:34:56.000Z")).to eq("2026/02/23")
      expect(described_class.format("2026-02-23T18:34:56.000Z")).to eq("2026/02/24")
    end

    it "タイムゾーンオフセット付き日時もJSTに変換して整形する" do
      expect(described_class.format("2026-02-23T23:30:00-05:00")).to eq("2026/02/24")
    end

    it "すでにYYYY/MM/DD形式ならそのまま返す" do
      expect(described_class.format("2026/2/3")).to eq("2026/02/03")
    end

    it "不正な文字列はそのまま返す" do
      expect(described_class.format("not-a-date")).to eq("not-a-date")
    end

    it "nilと空文字と空白文字はそのまま/空文字を返す" do
      expect(described_class.format(nil)).to be_nil
      expect(described_class.format("")).to eq("")
      expect(described_class.format("   ")).to eq("")
    end
  end
  it "存在しない日付を有効な表示日へ整形しない" do
    expect(described_class.format("2026/2/29")).to eq("2026/2/29")
    expect(described_class.format("2026-02-29T12:00:00Z")).to eq("2026-02-29T12:00:00Z")
    expect(described_class.format("2026-13-01")).to eq("2026-13-01")
    expect(described_class.format("2024/2/29")).to eq("2024/02/29")
  end

  [ 12, "12", "Feb 30", "12:34:56" ].each do |value|
    it "年月日を欠く#{value.inspect}に現在の日付を補わない" do
      expect(described_class.format(value)).to eq(value)
    end
  end

  [
    [ Date.new(2026, 2, 3), "2026/02/03" ],
    [ Time.iso8601("2026-02-03T18:00:00Z"), "2026/02/04" ],
    [ "Tue, 03 Feb 2026 18:00:00 +0000", "2026/02/04" ]
  ].each do |value, expected|
    it "年月日がそろった#{value.class}の既存形式を維持する" do
      expect(described_class.format(value)).to eq(expected)
    end
  end
end
