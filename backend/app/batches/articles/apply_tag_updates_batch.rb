require "json"

module Articles
  class ApplyTagUpdatesBatch
    Result = Data.define(:updated_count, :updated_articles)

    class ConfigurationError < StandardError; end

    def self.call(**kwargs)
      new(**kwargs).call
    end

    def initialize(
      updates_json: ENV["TAG_UPDATES_JSON"],
      update_service: Microcms::Articles::UpdateTagsService
    )
      @updates_json = updates_json
      @update_service = update_service
    end

    def call
      updates = parse_updates
      updated_articles = updates.map do |update|
        article_id = update.fetch(:id)
        tags = update.fetch(:tags)
        update_service.execute(article_id:, tags:)
      end

      Result.new(updated_count: updated_articles.size, updated_articles:)
    end

    private

    attr_reader :updates_json, :update_service

    def parse_updates
      raise ConfigurationError, "TAG_UPDATES_JSON is required" if updates_json.blank?

      parsed = JSON.parse(updates_json, symbolize_names: true)
      updates = parsed.is_a?(Hash) ? parsed[:tag_updates] : parsed
      raise ConfigurationError, "tag updates must be an array" unless updates.is_a?(Array)

      updates.map { |update| normalize_update(update) }
    rescue JSON::ParserError => error
      raise ConfigurationError, "TAG_UPDATES_JSON is invalid JSON: #{error.message}"
    end

    def normalize_update(update)
      raise ConfigurationError, "tag update must be an object" unless update.is_a?(Hash)

      id = update[:id].to_s.strip
      tags = normalize_tags(update[:tags])
      raise ConfigurationError, "tag update id is required" if id.blank?
      raise ConfigurationError, "tag update tags is required for article #{id}" if tags.blank?

      { id:, tags: }
    end

    def normalize_tags(value)
      return value.filter_map { |tag| tag.to_s.strip.presence }.join(",") if value.is_a?(Array)

      value.to_s.strip
    end
  end
end
