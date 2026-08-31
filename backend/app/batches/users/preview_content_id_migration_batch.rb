module Users
  class PreviewContentIdMigrationBatch
    Result = Data.define(:migrations, :skipped_records)

    def self.call(user_fetcher: Microcms::Users::FetchAllService)
      new(user_fetcher:).call
    end

    def initialize(user_fetcher:)
      @user_fetcher = user_fetcher
    end

    def call
      valid_records, skipped_records = user_fetcher.execute.partition { |record| valid?(record) }
      migrations = valid_records.group_by { |record| identity(record) }.map do |user_id, records|
        selected = records.max_by { |record| value(record, :updatedAt).to_s }
        {
          user_id:,
          content_id: Microcms::Users::Identity.content_id(user_id),
          name: value(selected, :name).to_s.strip,
          source_ids: records.map { |record| value(record, :id) }.compact,
          delete_ids: records.map { |record| value(record, :id) }.compact - [ Microcms::Users::Identity.content_id(user_id) ]
        }
      end.sort_by { |migration| migration[:user_id] }

      Result.new(migrations:, skipped_records: skipped_records.map { |record| skipped_record(record) })
    end

    private

    attr_reader :user_fetcher

    def valid?(record)
      record.is_a?(Hash) && !identity(record).empty? && !value(record, :name).to_s.strip.empty?
    end

    def identity(record)
      Microcms::Users::Identity.normalize(value(record, :user_id))
    end

    def skipped_record(record)
      return { id: nil, reason: "record is not an object" } unless record.is_a?(Hash)

      reason = identity(record).empty? ? "user_id is blank" : "name is blank"
      { id: value(record, :id), reason: }
    end

    def value(record, key)
      record[key] || record[key.to_s]
    end
  end
end
