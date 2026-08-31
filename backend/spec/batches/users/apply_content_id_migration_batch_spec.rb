require "rails_helper"

RSpec.describe Users::ApplyContentIdMigrationBatch do
  let(:preview_batch) { class_double(Users::PreviewContentIdMigrationBatch) }
  let(:upsert_service) { class_double(Microcms::Users::UpsertByContentIdService) }
  let(:delete_service) { class_double(Microcms::Users::DeleteService) }
  let(:migration) do
    {
      user_id: "alice",
      content_id: "u-2bd806c97f0e00af1a1fc3328fa763a9",
      name: "表示名",
      delete_ids: %w[legacy-a legacy-b]
    }
  end
  let(:preview_result) do
    Users::PreviewContentIdMigrationBatch::Result.new(migrations: [ migration ], skipped_records: [])
  end

  before do
    allow(preview_batch).to receive(:call).and_return(preview_result)
    allow(upsert_service).to receive(:execute)
    allow(delete_service).to receive(:execute)
  end

  it "正規IDへ更新してから旧IDを削除する" do
    result = described_class.call(preview_batch:, upsert_service:, delete_service:)

    expect(upsert_service).to have_received(:execute).with(
      content_id: "u-2bd806c97f0e00af1a1fc3328fa763a9", user_id: "alice", name: "表示名"
    ).ordered
    expect(delete_service).to have_received(:execute).with(content_id: "legacy-a").ordered
    expect(delete_service).to have_received(:execute).with(content_id: "legacy-b").ordered
    expect(result).to have_attributes(
      upserted_content_ids: [ "u-2bd806c97f0e00af1a1fc3328fa763a9" ],
      deleted_content_ids: %w[legacy-a legacy-b]
    )
  end

  it "要確認レコードがある場合はデータを変更しない" do
    allow(preview_batch).to receive(:call).and_return(
      Users::PreviewContentIdMigrationBatch::Result.new(migrations: [ migration ], skipped_records: [ { id: "bad" } ])
    )

    expect { described_class.call(preview_batch:, upsert_service:, delete_service:) }
      .to raise_error(/Migration aborted because preview contains skipped records/)
    expect(upsert_service).not_to have_received(:execute)
    expect(delete_service).not_to have_received(:execute)
  end
end
