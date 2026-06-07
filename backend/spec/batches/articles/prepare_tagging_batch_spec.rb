require "rails_helper"

RSpec.describe Articles::PrepareTaggingBatch do
  describe ".call" do
    subject(:result) do
      described_class.call(
        output_dir: output_dir,
        backup_batch: backup_batch,
        candidates_batch: candidates_batch
      )
    end

    let(:output_dir) { Rails.root.join("tmp/spec/tagging") }
    let(:backup_batch) { class_double(Articles::BackupToBigqueryBatch) }
    let(:candidates_batch) { class_double(Articles::ExportTaggingCandidatesBatch) }
    let(:backup_result) do
      Articles::BackupToBigqueryBatch::Result.new(
        dataset_id: "blog",
        table_id: "microcms_articles_backup",
        rows_count: 2,
        job_id: "job-1"
      )
    end
    let(:candidates_result) do
      Articles::ExportTaggingCandidatesBatch::Result.new(
        existing_tags: [
          { tag: "内省", count: 2 }
        ],
        tagged_articles: [
          {
            id: "tagged-1",
            title: "タグあり",
            author_name: "その他1",
            published_at: "2026-06-06T00:00:00Z",
            content: "<p>本文</p>",
            tags: "内省,生き方",
            tag_list: [ "内省", "生き方" ]
          }
        ],
        candidate_articles: [
          {
            id: "candidate-1",
            title: "タグなし",
            author_name: "その他2",
            published_at: "2026-06-07T00:00:00Z",
            content: "<p>候補本文</p>"
          }
        ]
      )
    end

    before do
      FileUtils.rm_rf(output_dir)
      allow(backup_batch).to receive(:call).and_return(backup_result)
      allow(candidates_batch).to receive(:call).with(limit: "0").and_return(candidates_result)
    end

    it do
      expect(result).to have_attributes(
        output_dir: output_dir.to_s,
        candidates_path: output_dir.join("candidates.json").to_s,
        tag_updates_path: output_dir.join("tag-updates.json").to_s,
        review_path: output_dir.join("review.md").to_s,
        backup: backup_result,
        candidates: candidates_result
      )
      expect(JSON.parse(output_dir.join("candidates.json").read)).to eq(
        {
          "existing_tags" => [
            { "tag" => "内省", "count" => 2 }
          ],
          "tagged_articles" => [
            {
              "id" => "tagged-1",
              "title" => "タグあり",
              "author_name" => "その他1",
              "published_at" => "2026-06-06T00:00:00Z",
              "content" => "<p>本文</p>",
              "tags" => "内省,生き方",
              "tag_list" => [ "内省", "生き方" ]
            }
          ],
          "candidate_articles" => [
            {
              "id" => "candidate-1",
              "title" => "タグなし",
              "author_name" => "その他2",
              "published_at" => "2026-06-07T00:00:00Z",
              "content" => "<p>候補本文</p>"
            }
          ]
        }
      )
      expect(JSON.parse(output_dir.join("tag-updates.json").read)).to eq({ "tag_updates" => [] })
      expect(output_dir.join("review.md").read).to include(
        "Candidate articles: 1",
        "Existing tags are reference material, not a constraint",
        "Prefer specific connection tags over broad tags",
        "### タグなし",
        "| id | title | current | proposed | reason |"
      )
    end
  end
end
