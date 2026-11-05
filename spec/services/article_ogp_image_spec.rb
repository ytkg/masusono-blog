require "rails_helper"

RSpec.describe ArticleOgpImage do
  let(:article) { { id: "article-1", title: "増田とその他！" } }

  describe ".version" do
    it "タイトルとテンプレート変更で版が変わる" do
      original = described_class.version(article:)
      expect(described_class.version(article: article.dup)).to eq(original)
      expect(described_class.version(article: article.merge(title: "更新"))).not_to eq(original)
      stub_const("ArticleOgpImage::TEMPLATE_VERSION", "next")
      expect(described_class.version(article:)).not_to eq(original)
    end
  end

  describe ".call" do
    subject(:result) { described_class.call(article:) }

    it "日本語タイトル入り1200×630 PNGを生成する" do
      expect(result.byteslice(0, 8)).to eq("\x89PNG\r\n\x1a\n".b)
      expect(result.byteslice(16, 8).unpack("NN")).to eq([ 1200, 630 ])
      expect(result.bytesize).to be < 5.megabytes
      expect(described_class.new.render(title: article[:title])).to eq(result)
      expect(result).not_to eq(File.binread(Rails.root.join("public/ogp-fallback.png")))
    end

    it "同じ版の画像をキャッシュする" do
      allow(Rails).to receive(:cache).and_return(ActiveSupport::Cache::MemoryStore.new)
      renderer = instance_double(described_class, render: "png")
      allow(described_class).to receive(:new).and_return(renderer)
      2.times { expect(described_class.call(article:)).to eq("png") }
      expect(renderer).to have_received(:render).once
    end

    context "生成に失敗する場合" do
      before do
        renderer = instance_double(described_class)
        allow(described_class).to receive(:new).and_return(renderer)
        allow(renderer).to receive(:render).and_raise(described_class::GenerationError)
      end

      it "キャッシュせず背景とロゴの共通PNGを返す" do
        expect(result).to eq(File.binread(Rails.root.join("public/ogp-fallback.png")))
      end
    end
  end

  describe "長文・絵文字の描画" do
    [ "日本語の長いタイトル👨‍👩‍👧‍👦🎉" * 15, "<b>見出し & 引用</b> 🥳✨" ].each do |title|
      it "#{title.first(20)}を描画できる" do
        bytes = described_class.new.render(title:)
        expect(bytes.byteslice(16, 8).unpack("NN")).to eq([ 1200, 630 ])
      end
    end
  end

  describe "句読点での改行" do
    let(:automatic_renderer) { described_class.new }

    before do
      allow(automatic_renderer).to receive(:prefer_punctuation_breaks)
    end

    [ "仕事柄、肩は凝ったけれど仕事のおかげで救われた。",
      "今日は晴れです。明日も晴れです。明後日も晴れです。" ].each do |title|
      it "短い行や余分な行を作る場合は自動折り返しを使う: #{title}" do
        expect(described_class.new.render(title:)).to eq(automatic_renderer.render(title:))
      end
    end

    it "行数を増やさず長さが揃う場合は句読点で区切る" do
      title = "無意味だと思っていたことも、実は無意味じゃなかったりする"
      expect(described_class.new.render(title:)).not_to eq(automatic_renderer.render(title:))
    end

    it "読点で短い行ができる場合は句点だけで区切る" do
      title = "仕事柄、肩は凝った。でも仕事のおかげで救われた。"
      expect(described_class.new.render(title:)).not_to eq(automatic_renderer.render(title:))
    end
  end
  it "感嘆符に続く助詞でタイトルを分割しない" do
    title = "いつも楽しい増田とその他！の新しいお話を皆さんへお届け"
    automatic_renderer = described_class.new
    allow(automatic_renderer).to receive(:prefer_punctuation_breaks)
    expect(described_class.new.render(title:)).to eq(automatic_renderer.render(title:))
  end

  it "描画コマンド失敗時の代替画像を記事の版としてキャッシュしない" do
    allow(Rails).to receive(:cache).and_return(ActiveSupport::Cache::MemoryStore.new)
    status = instance_double(Process::Status, success?: false)
    allow(Open3).to receive(:capture3).and_return([ "", "private stderr", status ])
    allow(Rails.logger).to receive(:warn)

    2.times do
      expect(described_class.call(article:)).to eq(File.binread(Rails.root.join("public/ogp-fallback.png")))
    end
    expect(Open3).to have_received(:capture3).twice
    expect(Rails.logger).to have_received(:warn).with("Article OGP generation failed; serving common image").twice
  end

  it "描画コマンドが見つからなくても代替画像を返し、次回は再試行する" do
    allow(Rails).to receive(:cache).and_return(ActiveSupport::Cache::MemoryStore.new)
    allow(Open3).to receive(:capture3).and_raise(Errno::ENOENT, "renderer unavailable")

    2.times do
      expect(described_class.call(article:)).to eq(File.binread(Rails.root.join("public/ogp-fallback.png")))
    end
    expect(Open3).to have_received(:capture3).twice
  end

  [ IOError, Errno::EACCES ].each do |error_class|
    it "生成画像の読込みで#{error_class}が起きても代替画像を返し一時ディレクトリを片付ける" do
      output_path = nil
      allow(File).to receive(:binread).and_call_original
      allow(File).to receive(:binread).with(end_with("/image.png")) do |path|
        output_path = path
        raise error_class, "image unavailable"
      end

      expect(described_class.call(article:)).to eq(File.binread(Rails.root.join("public/ogp-fallback.png")))
      expect(output_path).not_to be_nil
      expect(File.directory?(File.dirname(output_path))).to be(false)
    end
  end
end
