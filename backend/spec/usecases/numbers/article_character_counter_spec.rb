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
  end
end
