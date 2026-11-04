require "rails_helper"
require "google/cloud/bigquery"

[ Articles::BackupToBigqueryBatch, Articles::ExportTaggingCandidatesBatch ].each do |batch|
  RSpec.describe batch do
    subject(:result) { described_class.call(project_id: "test-project", dataset_id: "blog") }

    let(:credential_source) { :environment }
    let(:initialization_error) { Google::Auth::InitializationError.new("test credentials unavailable") }

    before do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("GOOGLE_APPLICATION_CREDENTIALS")
        .and_return(credential_source == :environment ? "/test/credentials.json" : nil)
      allow(File).to receive(:exist?).and_call_original
      allow(File).to receive(:exist?).with("/test/credentials.json").and_return(true)
      allow(File).to receive(:exist?).with(%r{/\.config/gcloud/application_default_credentials\.json\z})
        .and_return(credential_source == :default)
      allow(Google::Cloud::Bigquery).to receive(:new).with(project_id: "test-project").and_raise(initialization_error)
    end

    it "指定した資格情報ファイルで初期化に失敗したら設定手順を案内する" do
      expect { result }.to raise_error(described_class::ConfigurationError, /gcloud auth application-default login/)
    end

    context "既定のADCファイルを使う場合" do
      let(:credential_source) { :default }

      it "SDKの初期化失敗を設定エラーに変換する" do
        expect { result }.to raise_error(described_class::ConfigurationError, /gcloud auth application-default login/)
      end
    end

    context "SDKが資格情報以外の理由で失敗する場合" do
      let(:initialization_error) { IOError.new("SDK unavailable") }

      it "資格情報不足と誤認せず元の例外を返す" do
        expect { result }.to raise_error { |error| expect(error).to equal(initialization_error) }
      end
    end
  end
end
