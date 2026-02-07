require "rails_helper"

RSpec.describe ApplicationRecord do
  it do
    expect(described_class.abstract_class).to eq(true)
  end
end
