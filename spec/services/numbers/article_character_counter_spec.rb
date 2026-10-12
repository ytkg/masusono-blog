require "rails_helper"

RSpec.describe Numbers::ArticleCharacterCounter do
  describe ".call" do
    subject(:result) { described_class.call(html) }

    let(:html) do
      <<~HTML
        <p>本文 <a href="https://example.com/very/long/path">リンク</a></p>
        <figure><img src="https://example.com/image.jpg" alt="代替テキスト"></figure>
        <p>&amp; &nbsp; 🤒</p>
        <script>ignored()</script>
        <style>.ignored { color: red; }</style>
      HTML
    end

    it do
      expect(result).to eq(7)
    end

    context "結合絵文字と結合文字を含む場合" do
      let(:html) { "<p>👨‍👩‍👧‍👦 👩🏽‍💻 🇯🇵 e\u0301</p>" }

      it "表示される書記素ごとに1文字として数える" do
        expect(result).to eq(4)
      end
    end

    context "空白と不可視文字だけの場合" do
      let(:html) { "<p> \t\n&nbsp;\u200b\u200c\u200d\ufeff</p>" }

      it do
        expect(result).to eq(0)
      end
    end

    context "文字の間に不可視文字がある場合" do
      let(:html) { "<p>a\u200db\u200cc\u200b</p>" }

      it do
        expect(result).to eq(3)
      end
    end
  end
end
