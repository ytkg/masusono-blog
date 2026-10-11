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

RSpec.describe Numbers::ArticleCharacterCounter do
  [ nil, "" ].each do |html|
    it "counts #{html.inspect} without parsing HTML" do
      allow(Nokogiri::HTML5).to receive(:fragment).and_call_original
      expect(described_class.call(html)).to eq(0)
      expect(Nokogiri::HTML5).not_to have_received(:fragment)
    end
  end

  it "counts graphemes while ignoring invisible markup and spacing" do
    expect(described_class.call("<p>か\u3099👨‍👩‍👧‍👦 &nbsp; a</p><template>hidden</template><noscript>hidden</noscript>")).to eq(6)
  end
end
