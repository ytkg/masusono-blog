require "json"

module Articles
  class ApplyTagUpdatesFromFileBatch
    DEFAULT_UPDATES_PATH = Rails.root.join("tmp/tagging/tag-updates.json")

    Result = Data.define(:updated_count, :updated_articles, :backup, :candidates)

    class ConfigurationError < StandardError; end

    def self.call(**kwargs)
      new(**kwargs).call
    end

    def initialize(
      updates_path: ENV.fetch("TAG_UPDATES_PATH", DEFAULT_UPDATES_PATH),
      apply_batch: ApplyTagUpdatesBatch,
      backup_batch: BackupToBigqueryBatch,
      candidates_batch: ExportTaggingCandidatesBatch
    )
      @updates_path = Pathname.new(updates_path.to_s)
      @apply_batch = apply_batch
      @backup_batch = backup_batch
      @candidates_batch = candidates_batch
    end

    def call
      updates_json = read_updates_json
      updates = parse_updates(updates_json)

      apply_result = apply_updates(updates_json, updates)
      backup = backup_batch.call
      candidates = candidates_batch.call(limit: "0")

      Result.new(
        updated_count: apply_result.updated_count,
        updated_articles: apply_result.updated_articles,
        backup:,
        candidates:
      )
    end

    private

    attr_reader :updates_path, :apply_batch, :backup_batch, :candidates_batch

    def read_updates_json
      raise ConfigurationError, "tag updates file does not exist: #{updates_path}" unless updates_path.exist?

      updates_path.read
    end

    def parse_updates(updates_json)
      parsed = JSON.parse(updates_json, symbolize_names: true)
      updates = parsed.is_a?(Hash) ? parsed[:tag_updates] : parsed
      raise ConfigurationError, "tag updates must be an array" unless updates.is_a?(Array)

      updates
    rescue JSON::ParserError => error
      raise ConfigurationError, "tag updates file is invalid JSON: #{error.message}"
    end

    def apply_updates(updates_json, updates)
      return ApplyTagUpdatesBatch::Result.new(updated_count: 0, updated_articles: []) if updates.empty?

      apply_batch.call(updates_json:)
    end
  end
end
