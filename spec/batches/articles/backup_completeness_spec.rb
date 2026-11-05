require "rails_helper"

RSpec.describe Articles::BackupToBigqueryBatch do
  subject(:result) { described_class.call(project_id: "test-project", dataset_id: "backup", bigquery:) }

  let(:bigquery) { instance_double("Google::Cloud::Bigquery::Project") }
  let(:dataset) { instance_double("Google::Cloud::Bigquery::Dataset") }
  let(:table) { instance_double("Google::Cloud::Bigquery::Table") }
  let(:job) { instance_double("Google::Cloud::Bigquery::LoadJob", wait_until_done!: true, failed?: false, job_id: "fixture-job") }
  let(:error_class) { Microcms::FetchContentsService::FetchError }
  let(:endpoint) { Microcms::FetchArticlesService::ENDPOINT }
  let(:contents) { [ { id: "first" } ] }
  let(:body) { { contents:, totalCount: 2, limit: 1, offset: 0 }.to_json }
  let(:second_body) { { contents: [ { id: "second" } ], totalCount: 2, limit: 1, offset: 1 }.to_json }

  before do
    stub_microcms_api_key
    allow(bigquery).to receive(:dataset).with("backup").and_return(dataset)
    allow(dataset).to receive(:table).and_return(table)
    allow(dataset).to receive(:load_job).and_return(job)
    stub_request(:get, endpoint).with(query: { limit: "100", offset: "0", orders: "-publishedAt" }).to_return(body:)
    stub_request(:get, endpoint).with(query: { limit: "1", offset: "1", orders: "-publishedAt" }).to_return(body: second_body)
  end

  shared_examples "an unsafe snapshot" do
    it "取得を失敗させ、BigQuery操作を始めない" do
      expect { result }.to raise_error(error_class)
      expect(bigquery).not_to have_received(:dataset)
      expect(dataset).not_to have_received(:load_job)
    end
  end

  context "ページ数の上限に達した場合" do
    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("MICROCMS_MAX_PAGES").and_return("1")
    end

    include_examples "an unsafe snapshot"
  end

  context "件数の上限に達した場合" do
    let(:contents) { [ { id: "first" }, { id: "second" } ] }
    let(:body) { { contents:, totalCount: 2, limit: 100, offset: 0 }.to_json }

    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("MICROCMS_MAX_TOTAL_COUNT").and_return("1")
    end

    include_examples "an unsafe snapshot"
  end

  context "metadataなしの空応答の場合" do
    let(:body) { { contents: [] }.to_json }

    include_examples "an unsafe snapshot"
  end

  context "応答件数がmetadataに足りない場合" do
    let(:body) { { contents:, totalCount: 2, limit: 100, offset: 0 }.to_json }

    include_examples "an unsafe snapshot"
  end

  context "2ページ目の位置が巻き戻った場合" do
    let(:second_body) { { contents: [ { id: "second" } ], totalCount: 2, limit: 1, offset: 0 }.to_json }

    include_examples "an unsafe snapshot"
  end

  context "IDが重複する場合" do
    let(:error_class) { described_class::LoadError }
    let(:contents) { [ { id: "same" }, { id: "same" } ] }
    let(:body) { { contents:, totalCount: 2, limit: 100, offset: 0 }.to_json }

    include_examples "an unsafe snapshot"
  end

  context "IDがない場合" do
    let(:error_class) { described_class::LoadError }
    let(:contents) { [ { title: "missing id" } ] }
    let(:body) { { contents:, totalCount: 1, limit: 100, offset: 0 }.to_json }

    include_examples "an unsafe snapshot"
  end


  [ [ :totalCount, "2" ], [ :limit, "1" ], [ :offset, "0" ], [ :totalCount, -1 ], [ :limit, 0 ], [ :offset, -1 ], [ :offset, 1 ] ].each do |key, value|
    context "最初のmetadataが#{key}=#{value.inspect}の場合" do
      let(:body) { JSON.parse(super(), symbolize_names: true).merge(key => value).to_json }

      include_examples "an unsafe snapshot"
    end
  end

  [ [ :totalCount, 3 ], [ :limit, 2 ], [ :totalCount, "2" ] ].each do |key, value|
    context "後続metadataが#{key}=#{value.inspect}へ変わる場合" do
      let(:second_body) { JSON.parse(super(), symbolize_names: true).merge(key => value).to_json }

      include_examples "an unsafe snapshot"
    end
  end

  [ [], [ { id: "second" }, { id: "extra" } ] ].each do |rows|
    context "最後のページの件数が#{rows.size}の場合" do
      let(:second_body) { { contents: rows, totalCount: 2, limit: 1, offset: 1 }.to_json }

      include_examples "an unsafe snapshot"
    end
  end

  [ nil, "", "  ", 123, [], {} ].each do |id|
    context "IDが#{id.inspect}の場合" do
      let(:error_class) { described_class::LoadError }
      let(:contents) { [ { id: id } ] }
      let(:body) { { contents:, totalCount: 1, limit: 100, offset: 0 }.to_json }

      include_examples "an unsafe snapshot"
    end
  end

  context "別ページ間でIDが重複する場合" do
    let(:error_class) { described_class::LoadError }
    let(:second_body) { { contents: [ { id: "first" } ], totalCount: 2, limit: 1, offset: 1 }.to_json }

    include_examples "an unsafe snapshot"
  end

  context "両方の保護上限とちょうど一致する場合" do
    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("MICROCMS_MAX_PAGES").and_return("2")
      allow(ENV).to receive(:[]).with("MICROCMS_MAX_TOTAL_COUNT").and_return("2")
    end

    it "完全なsnapshotは拒否しない" do
      expect(result.rows_count).to eq(2)
    end
  end

  it "完全な2ページを保存する" do
    expect(result.rows_count).to eq(2)
    expect(dataset).to have_received(:load_job).with(described_class::TABLE_ID, anything, format: "json", write: "truncate")
  end

  context "metadataで0件が確認できる場合" do
    let(:body) { { contents: [], totalCount: 0, limit: 100, offset: 0 }.to_json }

    it "空のsnapshotを保存する" do
      expect(result.rows_count).to eq(0)
      expect(dataset).to have_received(:load_job)
    end
  end
end
