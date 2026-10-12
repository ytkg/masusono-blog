require "rails_helper"

RSpec.describe Articles::ApplyTagUpdatesFromFileBatch do
  describe ".call" do
    subject(:result) do
      described_class.call(
        updates_path: updates_path,
        apply_batch: apply_batch,
        backup_batch: backup_batch,
        candidates_batch: candidates_batch
      )
    end

    let(:updates_path) { Rails.root.join("tmp/spec/tagging/tag-updates.json") }
    let(:apply_batch) { class_double(Articles::ApplyTagUpdatesBatch) }
    let(:backup_batch) { class_double(Articles::BackupToBigqueryBatch) }
    let(:candidates_batch) { class_double(Articles::ExportTaggingCandidatesBatch) }
    let(:updates_json) do
      {
        tag_updates: [
          { id: "article-1", tags: "家族,内省,生き方" }
        ]
      }.to_json
    end
    let(:apply_result) do
      Articles::ApplyTagUpdatesBatch::Result.new(
        updated_count: 1,
        updated_articles: [
          { id: "article-1", tags: "家族,内省,生き方" }
        ]
      )
    end
    let(:backup_result) do
      Articles::BackupToBigqueryBatch::Result.new(
        dataset_id: "blog",
        table_id: "microcms_articles_backup",
        rows_count: 88,
        job_id: "job-1"
      )
    end
    let(:candidates_result) do
      Articles::ExportTaggingCandidatesBatch::Result.new(
        existing_tags: [],
        tagged_articles: [],
        candidate_articles: []
      )
    end

    before do
      FileUtils.mkdir_p(updates_path.dirname)
      updates_path.write(updates_json)
      allow(apply_batch).to receive(:call).with(updates_json: updates_json).and_return(apply_result)
      allow(backup_batch).to receive(:call).and_return(backup_result)
      allow(candidates_batch).to receive(:call).with(limit: "0").and_return(candidates_result)
    end

    it do
      expect(result).to have_attributes(
        updated_count: 1,
        updated_articles: [
          { id: "article-1", tags: "家族,内省,生き方" }
        ],
        backup: backup_result,
        candidates: candidates_result
      )
    end

    context "更新配列が空の場合" do
      let(:updates_json) { { tag_updates: [] }.to_json }

      it do
        expect(result).to have_attributes(
          updated_count: 0,
          updated_articles: [],
          backup: backup_result,
          candidates: candidates_result
        )
        expect(apply_batch).not_to have_received(:call)
      end
    end

    context "ファイルがない場合" do
      before do
        FileUtils.rm_f(updates_path)
      end

      it do
        expect { result }.to raise_error(
          described_class::ConfigurationError,
          "tag updates file does not exist: #{updates_path}"
        )
      end
    end

    context "JSON が不正な場合" do
      let(:updates_json) { "not-json" }

      it do
        expect { result }.to raise_error(
          described_class::ConfigurationError,
          /tag updates file is invalid JSON/
        )
      end
    end
  end
end
