require "rails_helper"

RSpec.describe Bookshelf::Catalog do
  subject(:result) { described_class.call }

  let(:first) { { isbn: "9784101010014", amazonUrl: "https://www.amazon.co.jp/dp/4101010013", appearances: { "old" => { id: "old", title: "初登場", publishedAt: "2026-01-01T00:00:00Z", time: Time.iso8601("2026-01-01T00:00:00Z") }, "new" => { id: "new", title: "再登場", publishedAt: "2026-02-01T00:00:00Z", time: Time.iso8601("2026-02-01T00:00:00Z") } } } }

  before do
    stub_const("Bookshelf::Catalog::BATCH_SIZE", 1)
    allow(Article).to receive(:all).and_return([])
    allow(Bookshelf::Candidates).to receive(:call).and_return([ first, { isbn: "9780804429573" }, { isbn: "9784101010021" } ])
    stub_request(:get, described_class::ENDPOINT).with(query: { isbn: "9784101010014" }).to_return(body: [ { summary: { isbn: "9784101010014", title: "書名", author: "著者" } } ].to_json)
    stub_request(:get, described_class::ENDPOINT).with(query: { isbn: "9780804429573" }).to_return(status: 429)
  end

  it "keeps successful books, sorts articles newest first, and stops after a failure" do
    expect(result[:partial]).to be(true)
    expect(result[:books].sole[:articles].pluck(:id)).to eq(%w[new old])
    expect(a_request(:get, described_class::ENDPOINT).with(query: { isbn: "9784101010021" })).not_to have_been_made
  end

  it "時間予算を使い切ったら追加リクエストを送らず取得済みの本を返す" do
    allow(Process).to receive(:clock_gettime).and_call_original
    allow(Process).to receive(:clock_gettime).with(Process::CLOCK_MONOTONIC).and_return(0, 1, 21)

    expect(result[:partial]).to be(true)
    expect(result[:books].sole[:isbn]).to eq("9784101010014")
    expect(a_request(:get, described_class::ENDPOINT).with(query: { isbn: "9780804429573" })).not_to have_been_made
  end
  [ {}, [], [ "invalid" ] ].each do |payload|
    it "書誌応答が#{payload.inspect}なら成功や正常0件として扱わず後続取得を止める" do
      stub_request(:get, described_class::ENDPOINT).with(query: { isbn: "9784101010014" }).to_return(body: payload.to_json)
      expect { result }.to raise_error(Faraday::Error, "Book metadata unavailable")
      expect(a_request(:get, described_class::ENDPOINT).with(query: { isbn: "9780804429573" })).not_to have_been_made
    end
  end

  context "候補がない場合" do
    before { allow(Bookshelf::Candidates).to receive(:call).and_return([]) }

    it "外部取得せず正常な空一覧を返す" do
      expect(result).to eq(books: [], partial: false)
      expect(a_request(:get, described_class::ENDPOINT)).not_to have_been_made
    end
  end

  context "単一候補の場合" do
    before { allow(Bookshelf::Candidates).to receive(:call).and_return([ first ]) }

    [ nil, {}, { summary: nil }, { summary: { isbn: "unknown", title: "書名", author: "著者" } },
      { summary: { isbn: "9784101010014", title: " ", author: "著者" } },
      { summary: { isbn: "9784101010014", title: "書名", author: nil } },
      { summary: { isbn: "9784101010014", title: 123, author: "著者" } } ].each do |entry|
      it "未登録・不完全な書誌 #{entry.inspect} は正常な空一覧として扱う" do
        stub_request(:get, described_class::ENDPOINT).with(query: { isbn: first[:isbn] }).to_return(body: [ entry ].to_json)
        expect(result).to eq(books: [], partial: false)
      end
    end
  end

  [ :timeout, :invalid_json, :unavailable ].each do |failure|
    context "最初の取得で#{failure}の場合" do
      before do
        request = stub_request(:get, described_class::ENDPOINT).with(query: { isbn: first[:isbn] })
        case failure
        when :timeout then request.to_timeout
        when :invalid_json then request.to_return(body: "{")
        when :unavailable then request.to_return(status: 503)
        end
      end

      it "正常0件にせず失敗を伝え、後続の取得を止める" do
        expect { result }.to raise_error(Faraday::Error, "Book metadata unavailable")
        expect(a_request(:get, described_class::ENDPOINT).with(query: { isbn: "9780804429573" })).not_to have_been_made
      end
    end
  end

  it "時間予算のちょうど上限でも取得を開始しない" do
    allow(Process).to receive(:clock_gettime).and_call_original
    allow(Process).to receive(:clock_gettime).with(Process::CLOCK_MONOTONIC).and_return(0, described_class::BUDGET_SECONDS)

    expect { result }.to raise_error(Faraday::Error, "Book metadata unavailable")
    expect(a_request(:get, described_class::ENDPOINT)).not_to have_been_made
  end

  it "後続バッチのJSONが壊れていても取得済みの本を保持する" do
    stub_request(:get, described_class::ENDPOINT).with(query: { isbn: "9780804429573" }).to_return(body: "{")

    expect(result[:partial]).to be(true)
    expect(result[:books].sole[:isbn]).to eq(first[:isbn])
    expect(a_request(:get, described_class::ENDPOINT).with(query: { isbn: "9784101010021" })).not_to have_been_made
  end
end
