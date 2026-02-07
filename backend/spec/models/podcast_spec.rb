require "rails_helper"

RSpec.describe Podcast do
  describe ".all" do
    subject(:result) { described_class.all }

    it do
      expect(result).to be_an(Array)
      expect(result).not_to be_empty
      expect(result).to all(be_a(Hash))
    end

    it do
      expect(result).to all(include("id", "title", "publishedAt", "audioUrl"))
    end
  end
end
