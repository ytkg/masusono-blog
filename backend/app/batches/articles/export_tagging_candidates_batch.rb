module Articles
  class ExportTaggingCandidatesBatch
    DEFAULT_LIMIT = 10
    TABLE_ID = "microcms_articles_backup".freeze

    Result = Data.define(:existing_tags, :tagged_articles, :candidate_articles)

    class ConfigurationError < StandardError; end

    def self.call(**kwargs)
      new(**kwargs).call
    end

    def initialize(
      project_id: ENV["BIGQUERY_PROJECT_ID"],
      dataset_id: ENV["BIGQUERY_DATASET_ID"],
      limit: ENV["TAGGING_CANDIDATE_LIMIT"],
      bigquery: nil
    )
      @project_id = project_id
      @dataset_id = dataset_id
      @limit = parse_limit(limit)
      @bigquery = bigquery
    end

    def call
      validate_configuration!

      rows = bigquery_client.query(query).to_a
      Result.new(
        existing_tags: build_existing_tags(rows),
        tagged_articles: build_tagged_articles(rows),
        candidate_articles: build_candidate_articles(rows)
      )
    end

    private

    attr_reader :project_id, :dataset_id, :limit, :bigquery

    def validate_configuration!
      raise ConfigurationError, "BIGQUERY_PROJECT_ID is required" if blank?(project_id)
      raise ConfigurationError, "BIGQUERY_DATASET_ID is required" if blank?(dataset_id)
      raise ConfigurationError, "BIGQUERY_PROJECT_ID contains invalid characters" unless project_id.match?(/\A[A-Za-z0-9_-]+\z/)
      raise ConfigurationError, "BIGQUERY_DATASET_ID contains invalid characters" unless dataset_id.match?(/\A[A-Za-z0-9_]+\z/)
    end

    def bigquery_client
      @bigquery_client ||= bigquery || begin
        validate_application_default_credentials!

        require "google/cloud/bigquery"
        Google::Cloud::Bigquery.new(project_id:)
      rescue StandardError => error
        raise unless error.class.name == "Google::Auth::InitializationError"

        raise ConfigurationError, <<~MESSAGE.squish
          Google Application Default Credentials were not found.
          Run `gcloud auth application-default login` on the host, then retry with Docker Compose.
        MESSAGE
      end
    end

    def validate_application_default_credentials!
      return if google_application_credentials_file?
      return if application_default_credentials_file?

      raise ConfigurationError, <<~MESSAGE.squish
        Google Application Default Credentials were not found.
        Run `gcloud auth application-default login` on the host, then retry with Docker Compose.
      MESSAGE
    end

    def google_application_credentials_file?
      path = ENV["GOOGLE_APPLICATION_CREDENTIALS"]
      path.present? && File.exist?(path)
    end

    def application_default_credentials_file?
      File.exist?(File.join(ENV.fetch("HOME", Dir.home), ".config/gcloud/application_default_credentials.json"))
    end

    def query
      <<~SQL
        SELECT id, title, author_name, published_at, content, tags
        FROM `#{project_id}.#{dataset_id}.#{TABLE_ID}`
        ORDER BY published_at DESC, id ASC
      SQL
    end

    def build_existing_tags(rows)
      counts = Hash.new(0)
      rows.each do |row|
        split_tags(value(row, :tags)).each { |tag| counts[tag] += 1 }
      end

      counts
        .sort_by { |tag, count| [ -count, tag ] }
        .map { |tag, count| { tag:, count: } }
    end

    def build_candidate_articles(rows)
      candidates = rows.filter_map do |row|
        next unless blank?(value(row, :tags))

        article_payload(row)
      end

      limit.zero? ? candidates : candidates.first(limit)
    end

    def build_tagged_articles(rows)
      rows.filter_map do |row|
        tags = split_tags(value(row, :tags))
        next if tags.empty?

        article_payload(row).merge(
          tags: value(row, :tags),
          tag_list: tags
        )
      end
    end

    def article_payload(row)
      {
        id: value(row, :id),
        title: value(row, :title),
        author_name: value(row, :author_name),
        published_at: timestamp_value(row, :published_at),
        content: value(row, :content)
      }
    end

    def split_tags(tags)
      tags.to_s
        .split(",")
        .filter_map do |tag|
          normalized_tag = tag.strip
          normalized_tag if normalized_tag.present?
        end
    end

    def parse_limit(raw_limit)
      parsed = Integer(raw_limit.presence || DEFAULT_LIMIT, exception: false)
      return DEFAULT_LIMIT if parsed.nil? || parsed.negative?

      parsed
    end

    def value(row, key)
      return row[key] if row.respond_to?(:key?) && row.key?(key)

      row[key.to_s]
    end

    def timestamp_value(row, key)
      value = value(row, key)
      value.respond_to?(:iso8601) ? value.iso8601 : value
    end

    def blank?(value)
      value.nil? || value.to_s.strip.empty?
    end
  end
end
