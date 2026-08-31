module Users
  class ApplyContentIdMigrationBatch
    Result = Data.define(:upserted_content_ids, :deleted_content_ids)

    def self.call(
      preview_batch: PreviewContentIdMigrationBatch,
      upsert_service: Microcms::Users::UpsertByContentIdService,
      delete_service: Microcms::Users::DeleteService
    )
      new(preview_batch:, upsert_service:, delete_service:).call
    end

    def initialize(preview_batch:, upsert_service:, delete_service:)
      @preview_batch = preview_batch
      @upsert_service = upsert_service
      @delete_service = delete_service
    end

    def call
      preview = preview_batch.call
      raise "Migration aborted because preview contains skipped records: #{preview.skipped_records.inspect}" if preview.skipped_records.any?

      upserted_content_ids = []
      deleted_content_ids = []

      preview.migrations.each do |migration|
        upsert_service.execute(
          content_id: migration.fetch(:content_id),
          user_id: migration.fetch(:user_id),
          name: migration.fetch(:name)
        )
        upserted_content_ids << migration.fetch(:content_id)

        migration.fetch(:delete_ids).each do |content_id|
          delete_service.execute(content_id:)
          deleted_content_ids << content_id
        end
      end

      Result.new(upserted_content_ids:, deleted_content_ids:)
    end

    private

    attr_reader :delete_service, :preview_batch, :upsert_service
  end
end
