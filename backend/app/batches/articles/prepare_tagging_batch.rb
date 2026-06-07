require "fileutils"
require "json"

module Articles
  class PrepareTaggingBatch
    DEFAULT_OUTPUT_DIR = Rails.root.join("tmp/tagging")

    Result = Data.define(
      :output_dir,
      :candidates_path,
      :tag_updates_path,
      :review_path,
      :backup,
      :candidates
    )

    def self.call(**kwargs)
      new(**kwargs).call
    end

    def initialize(
      output_dir: ENV.fetch("TAGGING_OUTPUT_DIR", DEFAULT_OUTPUT_DIR),
      backup_batch: BackupToBigqueryBatch,
      candidates_batch: ExportTaggingCandidatesBatch
    )
      @output_dir = Pathname.new(output_dir.to_s)
      @backup_batch = backup_batch
      @candidates_batch = candidates_batch
    end

    def call
      FileUtils.mkdir_p(output_dir)

      backup = backup_batch.call
      candidates = candidates_batch.call(limit: "0")

      write_json(candidates_path, candidates_payload(candidates))
      write_json(tag_updates_path, { tag_updates: [] })
      File.write(review_path, review_markdown(candidates))

      Result.new(
        output_dir: output_dir.to_s,
        candidates_path: candidates_path.to_s,
        tag_updates_path: tag_updates_path.to_s,
        review_path: review_path.to_s,
        backup:,
        candidates:
      )
    end

    private

    attr_reader :output_dir, :backup_batch, :candidates_batch

    def candidates_path
      output_dir.join("candidates.json")
    end

    def tag_updates_path
      output_dir.join("tag-updates.json")
    end

    def review_path
      output_dir.join("review.md")
    end

    def candidates_payload(candidates)
      {
        existing_tags: candidates.existing_tags,
        tagged_articles: candidates.tagged_articles,
        candidate_articles: candidates.candidate_articles
      }
    end

    def write_json(path, payload)
      File.write(path, JSON.pretty_generate(payload))
    end

    def review_markdown(candidates)
      <<~MARKDOWN
        # Article Tagging Review

        ## Summary

        - Existing tags: #{candidates.existing_tags.size}
        - Tagged articles: #{candidates.tagged_articles.size}
        - Candidate articles: #{candidates.candidate_articles.size}

        ## Rules

        - Tags should connect at least two articles.
        - Each article should have at most three tags.
        - Existing tags are reference material, not a constraint; create new tags when they connect at least two articles more clearly.
        - Prefer specific connection tags over broad tags such as `日常`, `生活`, `生き方`, `人間関係`, or `内省`.
        - Keep `tmp/tagging/tag-updates.json` machine-readable with only `id` and `tags`.

        ## Existing Tags

        #{existing_tags_markdown(candidates.existing_tags)}

        ## Candidate Articles

        #{candidate_articles_markdown(candidates.candidate_articles)}

        ## Proposed Updates

        Fill this section before applying updates.

        | id | title | current | proposed | reason |
        |---|---|---|---|---|
      MARKDOWN
    end

    def existing_tags_markdown(existing_tags)
      return "_No existing tags._" if existing_tags.empty?

      existing_tags.map { |tag| "- #{tag.fetch(:tag)}: #{tag.fetch(:count)}" }.join("\n")
    end

    def candidate_articles_markdown(candidate_articles)
      return "_No candidate articles._" if candidate_articles.empty?

      candidate_articles.map do |article|
        <<~MARKDOWN.chomp
          ### #{article.fetch(:title)}

          - id: `#{article.fetch(:id)}`
          - author: #{article.fetch(:author_name)}
          - published_at: #{article.fetch(:published_at)}
        MARKDOWN
      end.join("\n\n")
    end
  end
end
