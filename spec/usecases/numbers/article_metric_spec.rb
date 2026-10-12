require "rails_helper"

RSpec.describe Numbers::ArticleMetric do
  describe ".character_count" do
    subject(:result) { described_class.character_count(article) }

    let(:article) { { content: "<p>本文 <strong>です</strong></p>" } }

    it do
      expect(result).to eq(4)
    end

    context "本文がない場合" do
      let(:article) { {} }

      it do
        expect(result).to eq(0)
      end
    end
  end
end
