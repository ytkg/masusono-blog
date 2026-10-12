require "rails_helper"

RSpec.describe Articles::ApplyTagUpdatesBatch do
  describe ".call" do
    subject(:result) do
      described_class.call(
        updates_json: updates_json,
        update_service: update_service
      )
    end

    let(:update_service) { class_double(Microcms::Articles::UpdateTagsService) }
    let(:updates_json) do
      [
        { id: "flrqcz-944", tags: "本,街,思い出" },
        { id: "phuwqibnx7", tags: "街,喫茶店,写真" }
      ].to_json
    end

    before do
      allow(update_service).to receive(:execute) do |article_id:, tags:|
        { id: article_id, tags: tags }
      end
    end

    it do
      expect(result.updated_count).to eq(2)
      expect(result.updated_articles).to eq([
        { id: "flrqcz-944", tags: "本,街,思い出" },
        { id: "phuwqibnx7", tags: "街,喫茶店,写真" }
      ])
      expect(update_service).to have_received(:execute).with(article_id: "flrqcz-944", tags: "本,街,思い出")
      expect(update_service).to have_received(:execute).with(article_id: "phuwqibnx7", tags: "街,喫茶店,写真")
    end

    context "tag_updates キーを持つ object の場合" do
      let(:updates_json) do
        {
          tag_updates: [
            { id: "flrqcz-944", tags: "本,街,思い出" }
          ]
        }.to_json
      end

      it do
        expect(result.updated_articles).to eq([
          { id: "flrqcz-944", tags: "本,街,思い出" }
        ])
      end
    end

    context "tags が配列の場合" do
      let(:updates_json) do
        {
          tag_updates: [
            { id: "flrqcz-944", tags: [ "本", "街", "思い出" ] }
          ]
        }.to_json
      end

      it do
        expect(result.updated_articles).to eq([
          { id: "flrqcz-944", tags: "本,街,思い出" }
        ])
        expect(update_service).to have_received(:execute).with(article_id: "flrqcz-944", tags: "本,街,思い出")
      end
    end

    context "JSON が空の場合" do
      let(:updates_json) { "" }

      it do
        expect { result }.to raise_error(described_class::ConfigurationError, "TAG_UPDATES_JSON is required")
      end
    end

    context "JSON が不正な場合" do
      let(:updates_json) { "not-json" }

      it do
        expect { result }.to raise_error(described_class::ConfigurationError, /TAG_UPDATES_JSON is invalid JSON/)
      end
    end

    context "tags が空の場合" do
      let(:updates_json) { [ { id: "flrqcz-944", tags: " " } ].to_json }

      it do
        expect { result }.to raise_error(
          described_class::ConfigurationError,
          "tag update tags is required for article flrqcz-944"
        )
      end
    end
  end
end
