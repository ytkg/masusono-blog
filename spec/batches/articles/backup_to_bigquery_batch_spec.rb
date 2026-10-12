require "rails_helper"

RSpec.describe Articles::BackupToBigqueryBatch do
  describe ".call" do
    subject(:result) do
      described_class.call(
        project_id: "test-project",
        dataset_id: "blog_backup",
        bigquery: bigquery,
        article_fetcher: article_fetcher,
        clock: -> { Time.utc(2026, 6, 6, 1, 2, 3) }
      )
    end

    let(:bigquery) { instance_double("Google::Cloud::Bigquery::Project") }
    let(:dataset) { instance_double("Google::Cloud::Bigquery::Dataset") }
    let(:table) { instance_double("Google::Cloud::Bigquery::Table") }
    let(:schema) { instance_double("Google::Cloud::Bigquery::Schema") }
    let(:load_job) { instance_double("Google::Cloud::Bigquery::LoadJob", wait_until_done!: true, failed?: false, job_id: "job-1") }
    let(:article_fetcher) { class_double(Microcms::FetchArticlesService) }
    let(:articles) do
      [
        {
          id: "fo_tkdv5ujt",
          createdAt: "2026-06-04T16:17:03.115Z",
          updatedAt: "2026-06-04T16:46:31.330Z",
          publishedAt: "2026-06-04T16:17:03.115Z",
          revisedAt: "2026-06-04T16:46:31.330Z",
          title: "書き出し",
          author: {
            id: "kejk_o44e1",
            name: "その他1",
            title: "生活を検証する考察エンジニア",
            bio: "便利さを検証する人",
            icon: {
              url: "https://images.microcms-assets.io/assets/other-1.webp",
              height: 1024,
              width: 1024
            }
          },
          content: "<p>本文です</p>",
          tags: "これは, テスト,,です "
        }
      ]
    end

    before do
      allow(article_fetcher).to receive(:execute).and_return(articles)
      allow(bigquery).to receive(:dataset).with("blog_backup").and_return(nil)
      allow(bigquery).to receive(:create_dataset).with("blog_backup", location: "asia-northeast1").and_return(dataset)
      allow(dataset).to receive(:table).with("microcms_articles_backup").and_return(nil)
      allow(dataset).to receive(:create_table).with("microcms_articles_backup").and_yield(schema).and_return(table)
      allow(schema).to receive(:string)
      allow(schema).to receive(:timestamp)
      allow(schema).to receive(:integer)
      allow(schema).to receive(:json)
      allow(dataset).to receive(:load_job) do |table_id, file_path, format:, write:, &block|
        config = instance_double("Google::Cloud::Bigquery::LoadJob::Updater")
        allow(config).to receive(:location=)
        block.call(config)

        @loaded_table_id = table_id
        @loaded_file_path = file_path
        @loaded_format = format
        @loaded_write = write
        @loaded_rows = File.readlines(file_path).map { |line| JSON.parse(line) }
        load_job
      end
    end

    it do
      expect(result).to have_attributes(
        dataset_id: "blog_backup",
        table_id: "microcms_articles_backup",
        rows_count: 1,
        job_id: "job-1"
      )
      expect(@loaded_table_id).to eq("microcms_articles_backup")
      expect(@loaded_format).to eq("json")
      expect(@loaded_write).to eq("truncate")
      expect(@loaded_rows).to contain_exactly(
        {
          "id" => "fo_tkdv5ujt",
          "created_at" => "2026-06-04T16:17:03.115Z",
          "updated_at" => "2026-06-04T16:46:31.330Z",
          "published_at" => "2026-06-04T16:17:03.115Z",
          "revised_at" => "2026-06-04T16:46:31.330Z",
          "title" => "書き出し",
          "author_id" => "kejk_o44e1",
          "author_name" => "その他1",
          "author_title" => "生活を検証する考察エンジニア",
          "author_bio" => "便利さを検証する人",
          "author_icon_url" => "https://images.microcms-assets.io/assets/other-1.webp",
          "author_icon_height" => 1024,
          "author_icon_width" => 1024,
          "content" => "<p>本文です</p>",
          "tags" => "これは, テスト,,です ",
          "raw" => {
            "id" => "fo_tkdv5ujt",
            "createdAt" => "2026-06-04T16:17:03.115Z",
            "updatedAt" => "2026-06-04T16:46:31.330Z",
            "publishedAt" => "2026-06-04T16:17:03.115Z",
            "revisedAt" => "2026-06-04T16:46:31.330Z",
            "title" => "書き出し",
            "author" => {
              "id" => "kejk_o44e1",
              "name" => "その他1",
              "title" => "生活を検証する考察エンジニア",
              "bio" => "便利さを検証する人",
              "icon" => {
                "url" => "https://images.microcms-assets.io/assets/other-1.webp",
                "height" => 1024,
                "width" => 1024
              }
            },
            "content" => "<p>本文です</p>",
            "tags" => "これは, テスト,,です "
          },
          "backed_up_at" => "2026-06-06T01:02:03.000000Z"
        }
      )
      expect(load_job).to have_received(:wait_until_done!)
      expect(schema).to have_received(:string).with("id", mode: :required)
      expect(schema).to have_received(:string).with("tags")
      expect(schema).to have_received(:json).with("raw")
      expect(schema).to have_received(:timestamp).with("backed_up_at", mode: :required)
    end

    context "dataset と table が存在する場合" do
      before do
        allow(bigquery).to receive(:dataset).with("blog_backup").and_return(dataset)
        allow(dataset).to receive(:table).with("microcms_articles_backup").and_return(table)
      end

      it do
        result

        expect(bigquery).not_to have_received(:create_dataset)
        expect(dataset).not_to have_received(:create_table)
      end
    end

    context "環境変数が足りない場合" do
      subject(:result) do
        described_class.call(
          project_id: " ",
          dataset_id: "blog_backup",
          bigquery: bigquery,
          article_fetcher: article_fetcher
        )
      end

      it do
        expect { result }.to raise_error(described_class::ConfigurationError, "BIGQUERY_PROJECT_ID is required")
      end
    end

    context "load job が失敗した場合" do
      before do
        allow(load_job).to receive(:failed?).and_return(true)
        allow(load_job).to receive(:error).and_return({ "message" => "invalid json" })
      end

      it do
        expect { result }.to raise_error(described_class::LoadError, /invalid json/)
      end
    end

    context "Application Default Credentials が見つからない場合" do
      subject(:result) do
        described_class.call(
          project_id: "test-project",
          dataset_id: "blog_backup",
          article_fetcher: article_fetcher
        )
      end

      before do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with("GOOGLE_APPLICATION_CREDENTIALS").and_return(nil)
        allow(File).to receive(:exist?).and_call_original
        allow(File).to receive(:exist?).with(%r{/\.config/gcloud/application_default_credentials\.json\z}).and_return(false)
      end

      it do
        expect { result }.to raise_error(
          described_class::ConfigurationError,
          /gcloud auth application-default login/
        )
      end
    end
  end
end
