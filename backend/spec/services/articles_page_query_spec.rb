require "rails_helper"

RSpec.describe ArticlesPageQuery do
  [ nil, false, [], {}, -1, 1.5, "0x10" ].each do |offset|
    it "rejects offset #{offset.inspect} before reading articles" do
      allow(Article).to receive(:page)
      expect { described_class.call(offset:) }.to raise_error(described_class::InvalidOffset)
      expect(Article).not_to have_received(:page)
    end
  end

  [ [ [], 100, nil ], [ [ { id: "a" } ], 11, nil ], [ [ { id: "a" } ], 12, 11 ] ].each do |contents, total_count, next_offset|
    it "uses the actual returned size to decide the next offset (#{total_count}, #{contents.size})" do
      allow(Article).to receive(:page).with(limit: 10, offset: 10).and_return(contents:, total_count:)
      expect(described_class.call(offset: "10")[:pagination][:nextOffset]).to eq(next_offset)
    end
  end
end
