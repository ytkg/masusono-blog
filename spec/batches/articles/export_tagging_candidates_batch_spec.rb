require "rails_helper"

RSpec.describe Articles::ExportTaggingCandidatesBatch do
  describe ".call" do
    subject(:result) do
      described_class.call(
        project_id: "test-project",
        dataset_id: "blog_backup",
        limit: limit,
        bigquery: bigquery
      )
    end

    let(:bigquery) { instance_double("Google::Cloud::Bigquery::Project") }
    let(:limit) { "2" }
    let(:rows) do
      [
        {
          "id" => "article-1",
          "title" => "タグあり",
          "author_name" => "増田",
          "published_at" => Time.utc(2026, 6, 6),
          "content" => "<p>タグあり本文</p>",
          "tags" => "生活, 本"
        },
        {
          "id" => "article-2",
          "title" => "タグなし1",
          "author_name" => "その他1",
          "published_at" => Time.utc(2026, 6, 5),
          "content" => "<p>タグなし本文1</p>",
          "tags" => nil
        },
        {
          "id" => "article-3",
          "title" => "タグなし2",
          "author_name" => "その他2",
          "published_at" => "2026-06-04T00:00:00Z",
          "content" => "<p>タグなし本文2</p>",
          "tags" => " "
        },
        {
          "id" => "article-4",
          "title" => "タグなし3",
          "author_name" => "その他3",
          "published_at" => Time.utc(2026, 6, 3),
          "content" => "<p>タグなし本文3</p>",
          "tags" => ""
        },
        {
          "id" => "article-5",
          "title" => "タグあり2",
          "author_name" => "その他4",
          "published_at" => Time.utc(2026, 6, 2),
          "content" => "<p>タグあり本文2</p>",
          "tags" => "生活,街,本"
        }
      ]
    end

    before do
      allow(bigquery).to receive(:query).and_return(rows)
    end

    it do
      expect(result.existing_tags).to eq([
        { tag: "本", count: 2 },
        { tag: "生活", count: 2 },
        { tag: "街", count: 1 }
      ])
      expect(result.candidate_articles).to eq([
        {
          id: "article-2",
          title: "タグなし1",
          author_name: "その他1",
          published_at: "2026-06-05T00:00:00Z",
          content: "<p>タグなし本文1</p>"
        },
        {
          id: "article-3",
          title: "タグなし2",
          author_name: "その他2",
          published_at: "2026-06-04T00:00:00Z",
          content: "<p>タグなし本文2</p>"
        }
      ])
      expect(result.tagged_articles).to eq([
        {
          id: "article-1",
          title: "タグあり",
          author_name: "増田",
          published_at: "2026-06-06T00:00:00Z",
          content: "<p>タグあり本文</p>",
          tags: "生活, 本",
          tag_list: [ "生活", "本" ]
        },
        {
          id: "article-5",
          title: "タグあり2",
          author_name: "その他4",
          published_at: "2026-06-02T00:00:00Z",
          content: "<p>タグあり本文2</p>",
          tags: "生活,街,本",
          tag_list: [ "生活", "街", "本" ]
        }
      ])
      expect(bigquery).to have_received(:query).with(<<~SQL)
        SELECT id, title, author_name, published_at, content, tags
        FROM `test-project.blog_backup.microcms_articles_backup`
        ORDER BY published_at DESC, id ASC
      SQL
    end

    context "BigQueryの行がシンボルキーの場合" do
      let(:rows) { [ { id: "symbol", title: "記事", tags: nil, author_name: "著者", published_at: Time.utc(2026, 1, 1), content: "本文" } ] }

      it "文字列キーと同じ候補形式にする" do
        expect(result.candidate_articles).to eq([
          { id: "symbol", title: "記事", author_name: "著者", published_at: "2026-01-01T00:00:00Z", content: "本文" }
        ])
      end
    end

    context "limit が 0 の場合" do
      let(:limit) { "0" }

      it do
        expect(result.candidate_articles.map { |article| article[:id] }).to eq([ "article-2", "article-3", "article-4" ])
      end
    end

    context "project_id が不正な場合" do
      subject(:result) do
        described_class.call(
          project_id: "test-project;DROP",
          dataset_id: "blog_backup",
          bigquery: bigquery
        )
      end

      it do
        expect { result }.to raise_error(described_class::ConfigurationError, "BIGQUERY_PROJECT_ID contains invalid characters")
      end
    end

    context "Application Default Credentials が見つからない場合" do
      subject(:result) do
        described_class.call(
          project_id: "test-project",
          dataset_id: "blog_backup"
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
  [
    [ nil, "blog", "BIGQUERY_PROJECT_ID is required" ],
    [ "project", " ", "BIGQUERY_DATASET_ID is required" ],
    [ "project", "blog;DROP", "BIGQUERY_DATASET_ID contains invalid characters" ]
  ].each do |project_id, dataset_id, message|
    it "#{message}ならクエリを送らない" do
      client = double(query: [])
      expect { described_class.call(project_id:, dataset_id:, bigquery: client) }
        .to raise_error(described_class::ConfigurationError, message)
      expect(client).not_to have_received(:query)
    end
  end

  [ nil, "", "invalid", "-1" ].each do |limit|
    it "limit #{limit.inspect}は既定の10件へ戻す" do
      rows = 12.times.map { |index| { "id" => index.to_s, "tags" => nil } }
      client = double(query: rows)
      result = described_class.call(project_id: "project", dataset_id: "blog", bigquery: client, limit:)
      expect(result.candidate_articles.pluck(:id)).to eq((0...10).map(&:to_s))
    end
  end
end
