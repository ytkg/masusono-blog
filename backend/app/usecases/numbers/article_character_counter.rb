require "nokogiri"

module Numbers
  class ArticleCharacterCounter
    IGNORED_SELECTORS = "script, style, template, noscript".freeze
    WHITESPACE_PATTERN = /[[:space:]\u00a0\u200b\u200c\u200d\ufeff]/.freeze

    def self.call(html)
      new(html).call
    end

    def initialize(html)
      @html = html.to_s
    end

    def call
      text = visible_text
      text.gsub!(WHITESPACE_PATTERN, "")
      text.each_grapheme_cluster.count
    end

    private

    attr_reader :html

    def visible_text
      fragment = Nokogiri::HTML5.fragment(html)
      fragment.css(IGNORED_SELECTORS).remove
      fragment.text
    end
  end
end
