require "rails_helper"

RSpec.describe Microcms::ConnectionFactory do
  subject(:connection) { described_class.build(**options) }

  let(:options) { {} }

  it "読み取りと接続のタイムアウトを設定する" do
    expect(connection.options.timeout).to eq(10)
    expect(connection.options.open_timeout).to eq(5)
  end

  context "管理APIのURLを指定した場合" do
    let(:options) { { url: "https://example.test/" } }

    it "相対パスを指定したURLで解決する" do
      expect(connection.build_url("api/v2/media").to_s).to eq("https://example.test/api/v2/media")
    end
  end
end
