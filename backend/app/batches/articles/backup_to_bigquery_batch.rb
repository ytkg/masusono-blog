require "json"
require "tempfile"

module Articles
  class BackupToBigqueryBatch
    DATASET_LOCATION = "asia-northeast1".freeze
    TABLE_ID = "microcms_articles_backup".freeze

    Result = Data.define(:dataset_id, :table_id, :rows_count, :job_id)

    class ConfigurationError < StandardError; end
    class LoadError < StandardError; end

    def self.call(**kwargs)
      new(**kwargs).call
    end

    def initialize(
      project_id: ENV["BIGQUERY_PROJECT_ID"],
      dataset_id: ENV["BIGQUERY_DATASET_ID"],
      bigquery: nil,
      article_fetcher: Microcms::FetchArticlesService,
      clock: -> { Time.current }
    )
      @project_id = project_id
      @dataset_id = dataset_id
      @bigquery = bigquery
      @article_fetcher = article_fetcher
      @clock = clock
    end

    def call
      validate_configuration!

      dataset = find_or_create_dataset
      find_or_create_table(dataset)

      backed_up_at = timestamp_string(clock.call)
      rows = article_fetcher.execute.map { |article| build_row(article, backed_up_at:) }
      load_job = load_rows(dataset, rows)
      raise_on_load_error!(load_job)

      Result.new(dataset_id:, table_id: TABLE_ID, rows_count: rows.size, job_id: load_job.job_id)
    end

    private

    attr_reader :project_id, :dataset_id, :bigquery, :article_fetcher, :clock

    def validate_configuration!
      raise ConfigurationError, "BIGQUERY_PROJECT_ID is required" if blank?(project_id)
      raise ConfigurationError, "BIGQUERY_DATASET_ID is required" if blank?(dataset_id)
    end

    def find_or_create_dataset
      bigquery_client.dataset(dataset_id) || bigquery_client.create_dataset(dataset_id, location: DATASET_LOCATION)
    end

    def find_or_create_table(dataset)
      dataset.table(TABLE_ID) || dataset.create_table(TABLE_ID) { |schema| apply_schema(schema) }
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

    def apply_schema(schema)
      schema.string "id", mode: :required
      schema.timestamp "created_at"
      schema.timestamp "updated_at"
      schema.timestamp "published_at"
      schema.timestamp "revised_at"
      schema.string "title"
      schema.string "author_id"
      schema.string "author_name"
      schema.string "author_title"
      schema.string "author_bio"
      schema.string "author_icon_url"
      schema.integer "author_icon_height"
      schema.integer "author_icon_width"
      schema.string "content"
      schema.string "tags"
      schema.json "raw"
      schema.timestamp "backed_up_at", mode: :required
    end

    def load_rows(dataset, rows)
      Tempfile.create([ TABLE_ID, ".jsonl" ]) do |file|
        rows.each { |row| file.puts(JSON.generate(row)) }
        file.flush

        load_job = dataset.load_job(TABLE_ID, file.path, format: "json", write: "truncate") do |config|
          config.location = DATASET_LOCATION
        end
        load_job.wait_until_done!
        load_job
      end
    end

    def raise_on_load_error!(load_job)
      return unless load_job.respond_to?(:failed?) && load_job.failed?

      message =
        if load_job.respond_to?(:error) && load_job.error
          load_job.error.inspect
        elsif load_job.respond_to?(:errors)
          load_job.errors.inspect
        else
          "unknown BigQuery load error"
        end
      raise LoadError, message
    end

    def build_row(article, backed_up_at:)
      author = value(article, :author) || {}
      icon = value(author, :icon) || {}

      {
        id: value(article, :id),
        created_at: value(article, :createdAt),
        updated_at: value(article, :updatedAt),
        published_at: value(article, :publishedAt),
        revised_at: value(article, :revisedAt),
        title: value(article, :title),
        author_id: value(author, :id),
        author_name: value(author, :name),
        author_title: value(author, :title),
        author_bio: value(author, :bio),
        author_icon_url: value(icon, :url),
        author_icon_height: value(icon, :height),
        author_icon_width: value(icon, :width),
        content: value(article, :content),
        tags: value(article, :tags),
        raw: article,
        backed_up_at:
      }
    end

    def value(hash, key)
      return nil unless hash.is_a?(Hash)

      hash[key] || hash[key.to_s]
    end

    def timestamp_string(value)
      value.to_time.utc.iso8601(6)
    end

    def blank?(value)
      value.nil? || value.to_s.strip.empty?
    end
  end
end
