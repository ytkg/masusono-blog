module Numbers
  class ArticleMetric
    def self.character_count(article)
      ArticleCharacterCounter.call(article[:content])
    end
  end
end
