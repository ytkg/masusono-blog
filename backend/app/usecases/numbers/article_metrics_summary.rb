module Numbers
  class ArticleMetricsSummary
    include AuthorNameExtractor

    PRIORITY_AUTHOR_KEYWORD = AuthorRowsSorter::PRIORITY_AUTHOR_KEYWORD
    UNKNOWN_AUTHOR_NAME = "不明"

    def self.call(articles:)
      new(articles: articles).call
    end

    def initialize(articles:)
      @articles = articles
    end

    def call
      totals = summarize_articles

      {
        totals: totals,
        author_rows: AuthorRowsSorter.call(authors: totals[:authors])
      }
    end

    private

    attr_reader :articles

    def summarize_articles
      totals = initial_article_totals

      articles.each do |article|
        char_count = ArticleMetric.character_count(article)
        add_counts(totals, char_count)
        author_name = normalize_author_name(article[:author])
        add_counts(totals[:authors][author_name], char_count)
      end

      totals
    end

    def initial_article_totals
      {
        articles: 0,
        chars: 0,
        authors: Hash.new { |hash, key| hash[key] = { articles: 0, chars: 0 } }
      }
    end

    def add_counts(counts, char_count)
      counts[:articles] += 1
      counts[:chars] += char_count
    end

    def normalize_author_name(raw_author)
      normalized = extract_normalized_author_name(raw_author)
      normalized.empty? ? UNKNOWN_AUTHOR_NAME : normalized
    end
  end
end
