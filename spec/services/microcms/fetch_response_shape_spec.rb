require "rails_helper"

RSpec.describe Microcms::FetchArticlesService do
  subject(:result) { described_class.execute(api_key: "test-key") }

  let(:endpoint) { described_class::ENDPOINT }
  let(:query) { { limit: "100", offset: "0", orders: "-publishedAt" } }
  let(:status) { 200 }
  let(:body) { { contents: [], totalCount: 0, limit: 100, offset: 0 }.to_json }

  before do
    stub_request(:get, endpoint).with(query:).to_return(status:, body:)
  end

  it "正しい空配列を正常0件として返す" do
    expect(result).to eq([])
  end

  context "metadataなしの旧形式の場合" do
    let(:body) { { contents: [ { id: "legacy", author: { name: "名前" }, tags: [ { name: "Ruby" } ], enabled: true, missing: nil } ] }.to_json }

    it "オブジェクト内の入れ子も維持する" do
      expect(result).to eq([ { id: "legacy", author: { name: "名前" }, tags: [ { name: "Ruby" } ], enabled: true, missing: nil } ])
    end
  end

  shared_examples "an invalid content response" do
    it "再送せず、元の本文を含めない取得エラーへ変換する" do
      expect { result }.to raise_error(Microcms::FetchContentsService::FetchError) { |error|
        expect(error.status).to eq(502)
        expect(error.body).to eq("Invalid microCMS response")
        expect(error.cause).to be_nil
      }
      expect(a_request(:get, endpoint).with(query: hash_including({}))).to have_been_made.once
    end
  end

  [ "{", '{"private":"secret-fixture"', '{"contents":' + "[" * 102 + "]" * 102 + "}", "", "null", "true", "false", "123", '"private-body"', "[]" ].each do |value|
    context "HTTP200の本文が#{value.inspect}の場合" do
      let(:body) { value }

      include_examples "an invalid content response"
    end
  end

  [ nil, false, 123, "private-body", [], [ {} ] ].each do |value|
    context "contentsに#{value.inspect}が混在する場合" do
      let(:body) { { contents: [ { id: "valid" }, value ], totalCount: 2, limit: 100, offset: 0 }.to_json }

      include_examples "an invalid content response"
    end
  end

  [ nil, false, 123, "private-body", {} ].each do |value|
    context "contentsが配列でない#{value.inspect}の場合" do
      let(:body) { { contents: value }.to_json }

      include_examples "an invalid content response"
    end
  end

  context "contentsキーがない場合" do
    let(:body) { {}.to_json }

    include_examples "an invalid content response"
  end

  context "HTTP失敗の本文が不正JSONの場合" do
    let(:status) { 403 }
    let(:body) { "{" }

    it "元のHTTP失敗を優先する" do
      expect { result }.to raise_error(Microcms::FetchContentsService::FetchError) { |error|
        expect(error.status).to eq(403)
        expect(error.body).to eq(body)
      }
      expect(a_request(:get, endpoint).with(query: hash_including({}))).to have_been_made.once
    end
  end

  context "1ページだけ取得する場合" do
    subject(:result) { described_class.page(api_key: "test-key", limit: 10, offset: 0) }

    let(:query) { { limit: "10", offset: "0", orders: "-publishedAt" } }
    let(:body) { { contents: [], totalCount: 0, limit: 10, offset: 0 }.to_json }

    it "正しい空ページを正常0件として返す" do
      expect(result).to eq(contents: [], total_count: 0)
    end

    context "要求件数を超える応答の場合" do
      let(:body) { { contents: (0...15).map { |index| { id: index.to_s } }, totalCount: 15, limit: 10, offset: 0 }.to_json }

      it "要求した10件だけを返す" do
        expect(result[:contents].pluck(:id)).to eq((0...10).map(&:to_s))
      end
    end

    [ [ :totalCount, "1" ], [ :limit, "10" ], [ :offset, "0" ], [ :totalCount, -1 ], [ :offset, -1 ], [ :limit, 11 ], [ :offset, 1 ] ].each do |key, value|
      context "metadataの#{key}が#{value.inspect}の場合" do
        let(:body) { JSON.parse(super(), symbolize_names: true).merge(key => value).to_json }

        it "不正または要求と異なるページを拒否する" do
          expect { result }.to raise_error(Microcms::FetchContentsService::FetchError) { |error|
            expect(error.status).to eq(502)
            expect(error.body).to eq("Invalid pagination metadata")
          }
        end
      end
    end

    context "metadataがない旧形式の場合" do
      let(:body) { { contents: [] }.to_json }

      it "位置が不明なページを正常として返さない" do
        expect { result }.to raise_error(Microcms::FetchContentsService::FetchError) { |error| expect(error.status).to eq(502) }
      end
    end


    [ "{", "[]", { contents: [ nil ], totalCount: 1, limit: 10, offset: 0 }.to_json ].each do |value|
      context "本文が#{value.inspect}の場合" do
        let(:body) { value }

        include_examples "an invalid content response"
      end
    end
  end

  context "2ページ目が不正な場合" do
    let(:body) { { contents: [ { id: "first" } ], totalCount: 3, limit: 1, offset: 0 }.to_json }

    [ "{", { contents: [ nil ], totalCount: 3, limit: 1, offset: 1 }.to_json ].each do |value|
      it "取得済みの1ページ目を成功結果として返さず中断する: #{value}" do
        stub_request(:get, endpoint).with(query: { limit: "1", offset: "1", orders: "-publishedAt" })
          .to_return(status: 200, body: value)

        expect { result }.to raise_error(Microcms::FetchContentsService::FetchError) { |error| expect(error.status).to eq(502) }
        expect(a_request(:get, endpoint).with(query: hash_including({}))).to have_been_made.twice
      end
    end
  end

  context "Hash本文を返す想定外のtransportの場合" do
    it "Rubyの型例外ではなく取得エラーにする" do
      response = double(success?: true, body: { contents: [] })
      expect { described_class.execute(api_key: "test-key", response:) }.to raise_error(Microcms::FetchContentsService::FetchError)
    end
  end
end
