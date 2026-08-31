require "rails_helper"

RSpec.describe Users::PreviewContentIdMigrationBatch do
  let(:user_fetcher) { class_double(Microcms::Users::FetchAllService) }

  before do
    allow(user_fetcher).to receive(:execute).and_return(records)
  end

  context "有効な重複レコードがある場合" do
    let(:records) do
      [
        { "id" => "old", "user_id" => " alice ", "name" => "旧名", "updatedAt" => "2026-01-01T00:00:00Z" },
        { "id" => "new", "user_id" => "alice", "name" => "新名", "updatedAt" => "2026-02-01T00:00:00Z" },
        { "id" => "invalid", "user_id" => "", "name" => "対象外" }
      ]
    end

    it "最新の表示名を採用し、不完全なレコードを要確認として報告する" do
      result = described_class.call(user_fetcher:)

      expect(result.migrations).to eq([
        {
          user_id: "alice",
          content_id: "u-2bd806c97f0e00af1a1fc3328fa763a9",
          name: "新名",
          source_ids: %w[old new],
          delete_ids: %w[old new]
        }
      ])
      expect(result.skipped_records).to eq([ { id: "invalid", reason: "user_id is blank" } ])
    end
  end
end
