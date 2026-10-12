require "json"

namespace :users do
  desc "Preview microCMS user content ID migration without changing data"
  task preview_content_id_migration: :environment do
    result = Users::PreviewContentIdMigrationBatch.call
    puts JSON.pretty_generate(
      migrations: result.migrations,
      skipped_records: result.skipped_records,
      migration_count: result.migrations.size,
      skipped_count: result.skipped_records.size
    )
  end

  desc "Apply microCMS user content ID migration (requires CONFIRM=true)"
  task apply_content_id_migration: :environment do
    abort "Set CONFIRM=true after reviewing users:preview_content_id_migration output" unless ENV["CONFIRM"] == "true"

    result = Users::ApplyContentIdMigrationBatch.call
    puts JSON.pretty_generate(
      upserted_content_ids: result.upserted_content_ids,
      deleted_content_ids: result.deleted_content_ids,
      upserted_count: result.upserted_content_ids.size,
      deleted_count: result.deleted_content_ids.size
    )
  end
end
