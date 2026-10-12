require "rails_helper"

RSpec.describe AuthorPayloadBuilder do
  describe ".call" do
    subject(:result) { described_class.call(author:) }

    let(:author) do
      {
        id: "author-1",
        name: "増田",
        title: "著者肩書き",
        bio: "プロフィール本文",
        imageUrl: "https://images.microcms-assets.io/assets/masuda.webp"
      }
    end

    it do
      expect(result).to eq(
        {
          id: "author-1",
          name: "増田",
          title: "著者肩書き",
          bio: "プロフィール本文",
          imageUrl: "https://images.microcms-assets.io/assets/masuda.webp?fit=crop&w=192&h=192"
        }
      )
    end

    context "idまたは名前が空の場合" do
      let(:author) { { id: "", name: "増田" } }

      it do
        expect(result).to be_nil
      end
    end
  end
end
