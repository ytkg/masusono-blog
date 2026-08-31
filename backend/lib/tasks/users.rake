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
end
