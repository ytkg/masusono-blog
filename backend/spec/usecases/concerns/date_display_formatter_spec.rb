require "rails_helper"

RSpec.describe DateDisplayFormatter do
  describe ".format" do
    it "ISO形式の日時をJSTの日付でYYYY/MM/DDへ整形する" do
      expect(described_class.format("2026-02-23T12:34:56.000Z")).to eq("2026/02/23")
      expect(described_class.format("2026-02-23T18:34:56.000Z")).to eq("2026/02/24")
    end

    it "すでにYYYY/MM/DD形式ならそのまま返す" do
      expect(described_class.format("2026/2/3")).to eq("2026/02/03")
    end

    it "不正な文字列はそのまま返す" do
      expect(described_class.format("not-a-date")).to eq("not-a-date")
    end

    it "nilと空文字はそのまま返す" do
      expect(described_class.format(nil)).to be_nil
      expect(described_class.format("")).to eq("")
    end
  end
end
