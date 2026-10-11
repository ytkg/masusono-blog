module Numbers
  class ArticleMetricsSummary
    include AuthorNameExtractor

    UNKNOWN_AUTHOR_NAME = "不明"

    def self.call(articles:, character_counter: ArticleMetric.method(:character_count))
      new(articles:, character_counter:).call
    end

    def initialize(articles:, character_counter: ArticleMetric.method(:character_count))
      @articles = articles
      @character_counter = character_counter
    end

    def call
      totals = summarize_articles

      {
        totals:,
        author_rows: AuthorRowsSorter.call(authors: totals[:authors])
      }
    end

    private

    attr_reader :articles, :character_counter

    def summarize_articles
      articles.each_with_object(initial_article_totals) do |article, totals|
        char_count = character_counter.call(article)
        add_counts(totals, char_count)
        author_name = normalize_author_name(article[:author])
        add_counts(totals[:authors][author_name], char_count)
      end
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
