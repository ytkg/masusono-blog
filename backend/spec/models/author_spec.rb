require "rails_helper"

RSpec.describe Author do
  describe ".find" do
    subject(:result) { described_class.find(author_id) }

    let(:author_id) { "author-1" }

    before do
      allow(Microcms::FetchAuthorsService).to receive(:execute)
        .with(ids: "author-1")
        .and_return([ { id: author_id, name: "著者" } ])
    end

    it do
      expect(result).to eq({ id: author_id, name: "著者" })
    end

    context "IDが空の場合" do
      let(:author_id) { "" }

      it do
        expect(result).to be_nil
      end
    end
  end
end
