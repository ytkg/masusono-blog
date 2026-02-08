require "rails_helper"

RSpec.describe Shop do
  describe ".all" do
    subject(:result) { described_class.all }

    it do
      expect(result).to be_an(Array)
      expect(result).not_to be_empty
      expect(result).to all(be_a(Hash))
    end

    it do
      expect(result).to all(include(:name, :lat, :lng, :category, :url, :desc))
      expect(result).to all(include(lat: be_a(Numeric), lng: be_a(Numeric)))
    end
  end
end
