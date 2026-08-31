require "rails_helper"

RSpec.describe Microcms::Articles::UpdateTagsService do
  describe ".execute" do
    subject(:result) { service_class.execute(article_id: article_id, tags: tags) }

    let(:service_class) do
      klass = Class.new(described_class)
      klass.const_set(:ENDPOINT, "https://example.test/api/v1/articles".freeze)
      stub_const("Microcms::TestArticlesUpdateTagsService", klass)
    end
    let(:endpoint) { "#{service_class::ENDPOINT}/#{article_id}" }
    let(:article_id) { "article-1" }
    let(:tags) { "本,街,思い出" }

    before do
      stub_microcms_api_key
    end

    context "更新成功時" do
      before do
        stub_request(:patch, endpoint)
          .with(
            headers: {
              "Accept" => "application/json",
              "Content-Type" => "application/json",
              "X-MICROCMS-API-KEY" => "test-api-key"
            },
            body: { tags: tags }.to_json
          )
          .to_return(status: 200, body: { id: article_id }.to_json, headers: json_response_headers)
      end

      it do
        expect(result).to eq({ id: article_id, tags: tags })
      end
    end

    context "更新失敗時" do
      before do
        stub_request(:patch, endpoint)
          .to_return(status: 503, body: "upstream unavailable", headers: json_response_headers)
      end

      it do
        expect { result }.to raise_error(
          Microcms::FetchContentsService::FetchError,
          "microCMS request failed: status=503"
        )
      end
    end
  end
end
