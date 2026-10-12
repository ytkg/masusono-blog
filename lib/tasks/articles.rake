require "json"

namespace :articles do
  desc "Back up microCMS articles to BigQuery"
  task backup_to_bigquery: :environment do
    result = Articles::BackupToBigqueryBatch.call

    puts "Backed up #{result.rows_count} articles to #{result.dataset_id}.#{result.table_id}"
    puts "BigQuery load job: #{result.job_id}" if result.job_id.present?
  end

  desc "Export BigQuery articles without tags and existing tag counts as JSON"
  task export_tagging_candidates: :environment do
    result = Articles::ExportTaggingCandidatesBatch.call

    puts JSON.pretty_generate(
      {
        existing_tags: result.existing_tags,
        tagged_articles: result.tagged_articles,
        candidate_articles: result.candidate_articles
      }
    )
  end

  desc "Prepare article tagging files under tmp/tagging"
  task prepare_tagging: :environment do
    result = Articles::PrepareTaggingBatch.call

    puts "Backed up #{result.backup.rows_count} articles to #{result.backup.dataset_id}.#{result.backup.table_id}"
    puts "BigQuery load job: #{result.backup.job_id}" if result.backup.job_id.present?
    puts "Candidate articles: #{result.candidates.candidate_articles.size}"
    puts "Candidates: #{result.candidates_path}"
    puts "Tag updates: #{result.tag_updates_path}"
    puts "Review: #{result.review_path}"
  end

  desc "Apply confirmed article tag updates to microCMS from TAG_UPDATES_JSON"
  task apply_tag_updates: :environment do
    result = Articles::ApplyTagUpdatesBatch.call

    puts "Updated #{result.updated_count} articles"
    result.updated_articles.each do |article|
      puts "#{article.fetch(:id)}: #{article.fetch(:tags)}"
    end
  end

  desc "Apply confirmed article tag updates from tmp/tagging/tag-updates.json"
  task apply_tag_updates_from_file: :environment do
    result = Articles::ApplyTagUpdatesFromFileBatch.call

    puts "Updated #{result.updated_count} articles"
    result.updated_articles.each do |article|
      puts "#{article.fetch(:id)}: #{article.fetch(:tags)}"
    end
    puts "Backed up #{result.backup.rows_count} articles to #{result.backup.dataset_id}.#{result.backup.table_id}"
    puts "BigQuery load job: #{result.backup.job_id}" if result.backup.job_id.present?
    puts "Candidate articles: #{result.candidates.candidate_articles.size}"
  end
end
