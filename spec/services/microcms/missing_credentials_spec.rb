require "rails_helper"

RSpec.describe "microCMSクライアントの資格情報検証" do
  [
    [ Microcms::FetchContentsService, {} ],
    [ Microcms::CreateContentService, { endpoint: "https://example.test/contents", attributes: {} } ],
    [ Microcms::Articles::UpdateTagsService, {} ],
    [ Microcms::Users::Client, { endpoint: "https://example.test/users" } ],
    [ Microcms::Users::DeleteService, {} ],
    [ Microcms::Users::UpsertByContentIdService, {} ],
    [ Microcms::FetchManagedArticlesService, {} ],
    [ Microcms::FetchMediaService, {} ],
    [ Microcms::UploadMediaService, {} ]
  ].each do |service, arguments|
    describe service.name do
      before do
        allow(Rails.application.credentials).to receive(:dig).with(:microcms, :api_key).and_return(nil)
        allow(Microcms::ConnectionFactory).to receive(:build)
      end

      [ nil, "" ].each do |api_key|
        it "APIキーが#{api_key.inspect}なら接続を作成せず停止する" do
          expect { service.new(**arguments, api_key:) }.to raise_error(StandardError, /api key is missing/i)
          expect(Microcms::ConnectionFactory).not_to have_received(:build)
        end
      end
    end
  end
end
