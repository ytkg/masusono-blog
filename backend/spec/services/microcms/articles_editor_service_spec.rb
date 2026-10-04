require "rails_helper"

RSpec.describe Microcms::Articles::EditorService do
  subject(:service) { described_class.new(api_key: "test-key") }

  let(:metadata) { { id: "article-1", status: [ "PUBLISH" ], updatedAt: "2026-01-01T00:00:00Z" } }
  let(:article) { { id: "article-1", title: "元タイトル", content: "<p>本文</p>", author: { id: "author-1" }, publishedAt: "2026-01-01T00:00:00Z", tags: "自動タグ" } }
  let(:schema_kind) { "richEditorV2" }
  let(:attributes) { { "title" => "修正タイトル" } }
  let(:management_url) { "#{described_class::MANAGEMENT_ENDPOINT}/article-1" }
  let(:content_url) { "#{described_class::CONTENT_ENDPOINT}/article-1" }

  before do
    stub_request(:get, management_url).to_return(body: metadata.to_json)
    stub_request(:get, content_url).to_return(body: article.to_json)
    stub_request(:get, described_class::SCHEMA_ENDPOINT).to_return(body: { apiFields: [ { fieldId: "content", kind: schema_kind } ] }.to_json)
    stub_request(:patch, content_url).to_return(body: { id: "article-1" }.to_json)
  end

  it "加工前の本文と著者IDを返し、秘密情報は返さない" do
    result = service.fetch("article-1")
    expect(result).to include(content: "<p>本文</p>", author_id: "author-1", editable: true, content_editable: true)
    expect(result.keys).not_to include(:draftKey, :api_key, :tags)
  end

  it "公開ステータス・タグ・未編集の本文を送らずタイトルだけ更新する" do
    revision = service.fetch("article-1")[:revision]
    service.update("article-1", attributes:, expected_revision: revision)
    expect(WebMock).to have_requested(:patch, content_url).with(body: { title: "修正タイトル" }.to_json)
  end

  it "変更がなければPATCHしない" do
    revision = service.fetch("article-1")[:revision]
    service.update("article-1", attributes: { "title" => article[:title] }, expected_revision: revision)
    expect(WebMock).not_to have_requested(:patch, content_url)
  end

  it "更新日時の変化を409で拒否する" do
    expect { service.update("article-1", attributes:, expected_revision: "old-revision") }.to raise_error(described_class::Error) { |error| expect(error.status).to eq(:conflict) }
    expect(WebMock).not_to have_requested(:patch, content_url)
  end

  context "未公開" do
    let(:metadata) { super().merge(status: [ "DRAFT" ], draftKey: "private-draft-key") }
    before do
      stub_request(:get, "#{content_url}?draftKey=private-draft-key").to_return(body: article.to_json)
    end

    it "下書きキーをサーバー内だけで使い、未公開のまま更新する" do
      current = service.fetch("article-1")
      expect(current[:status]).to eq("DRAFT")
      expect(current.to_json).not_to include("private-draft-key")
      service.update("article-1", attributes:, expected_revision: current[:revision])
      expect(WebMock).to have_requested(:patch, content_url).with(body: { title: "修正タイトル" }.to_json)
    end
  end

  %w[PUBLISH_AND_DRAFT CLOSED].each do |status|
    context status do
      let(:metadata) { super().merge(status: [ status ]) }
      it "本文を取得せず編集を拒否する" do
        expect(service.fetch("article-1")[:editable]).to be(false)
        expect { service.update("article-1", attributes:, expected_revision: "any") }.to raise_error(described_class::Error, /microCMS/)
        expect(WebMock).not_to have_requested(:get, content_url)
        expect(WebMock).not_to have_requested(:patch, content_url)
      end
    end
  end

  context "旧エディタ" do
    let(:schema_kind) { "richEditor" }
    it "本文変更を拒否するがタイトルだけの変更は許可する" do
      current = service.fetch("article-1")
      expect(current[:content_editable]).to be(false)
      expect { service.update("article-1", attributes: { "content" => "<p>修正</p>" }, expected_revision: current[:revision]) }.to raise_error(described_class::Error, /保存形式/)
      service.update("article-1", attributes:, expected_revision: current[:revision])
    end
  end

  it "スキーマ取得権限がなければ本文保存を許可しない" do
    stub_request(:get, described_class::SCHEMA_ENDPOINT).to_return(status: 403, body: "{}")
    expect(service.fetch("article-1")[:content_editable]).to be(false)
  end

  it "対応外HTML・危険なURLを送らない" do
    revision = service.fetch("article-1")[:revision]
    [ '<p onclick="alert(1)">本文</p>', '<iframe src="https://example.com"></iframe>', '<p><a href="javascript:alert(1)">リンク</a></p>' ].each do |content|
      expect { service.update("article-1", attributes: { "content" => content }, expected_revision: revision) }.to raise_error(described_class::Error, /装飾/)
    end
    expect(WebMock).not_to have_requested(:patch, content_url)
  end

  it "未来の公開日時や不正な入力を拒否する" do
    [ { "publishedAt" => 1.day.from_now.iso8601 }, { "publishedAt" => "bad" }, { "title" => " " }, { "status" => "PUBLISH" } ].each do |input|
      expect { service.update("article-1", attributes: input, expected_revision: "any") }.to raise_error(described_class::Error)
    end
    expect(WebMock).not_to have_requested(:patch, content_url)
  end

  it "更新後に内容が一致しなければ再保存を止める" do
    revision = service.fetch("article-1")[:revision]
    result = service.update("article-1", attributes:, expected_revision: revision)
    expect(result).to include(save_uncertain: true, revision: nil)
  end

  it "保存内容が一致したら更新された記事を返す" do
    revision = service.fetch("article-1")[:revision]
    stub_request(:get, content_url).to_return(body: article.to_json).then.to_return(body: article.merge(title: "修正タイトル").to_json)
    result = service.update("article-1", attributes:, expected_revision: revision)
    expect(result).to include(title: "修正タイトル")
    expect(result[:save_uncertain]).to be_nil
  end

  it "更新日時が欠けていたら保存しない" do
    stub_request(:get, management_url).to_return(body: metadata.except(:updatedAt).to_json)
    expect { service.update("article-1", attributes:, expected_revision: "any") }.to raise_error(described_class::Error, /更新日時/)
    expect(WebMock).not_to have_requested(:patch, content_url)
  end

  it "PATCHのタイムアウトでは保存結果不明を返す" do
    revision = service.fetch("article-1")[:revision]
    stub_request(:patch, content_url).to_timeout
    expect { service.update("article-1", attributes:, expected_revision: revision) }.to raise_error(described_class::Error) { |error| expect(error.code).to eq("save_uncertain") }
  end
end
