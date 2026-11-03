require "rails_helper"

RSpec.describe Microcms::Users::Identity do
  describe ".content_id" do
    it "前後空白を除去したuser_idから固定長のコンテンツIDを生成する" do
      expect(described_class.content_id(" cookie-user ")).to eq("u-e329d2ee785ead849d97f03f875fd338")
    end
  end
  [ nil, "", " " ].each do |user_id|
    it "空のユーザーID#{user_id.inspect}に共有のコンテンツIDを割り当てない" do
      expect { described_class.content_id(user_id) }.to raise_error(ArgumentError, "user_id is required")
    end
  end
end
