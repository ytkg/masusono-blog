module Numbers
  class ArticleMetricsSummary
    include AuthorNameExtractor

    PRIORITY_AUTHOR_KEYWORD = "増田"
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
        author_rows: sort_author_rows(totals[:authors])
      }
    end

    private

    attr_reader :articles

    def summarize_articles
      totals = initial_article_totals

      articles.each do |article|
        char_count = article_char_count(article)
        add_article_totals(totals, char_count)
        add_author_totals(totals, normalize_author_name(article[:author]), char_count)
      end

      totals
    end

    def sort_author_rows(authors)
      authors.sort_by do |name, _data|
        [ name.include?(PRIORITY_AUTHOR_KEYWORD) ? 0 : 1, natural_sort_key(name) ]
      end
    end

    def natural_sort_key(name)
      name.scan(/\d+|\D+/).map { |part| part.match?(/\A\d+\z/) ? [ 1, part.to_i ] : [ 0, part ] }
    end

    def initial_article_totals
      {
        articles: 0,
        chars: 0,
        authors: Hash.new { |hash, key| hash[key] = { articles: 0, chars: 0 } }
      }
    end

    def add_article_totals(totals, char_count)
      totals[:articles] += 1
      totals[:chars] += char_count
    end

    def add_author_totals(totals, author_name, char_count)
      totals[:authors][author_name][:articles] += 1
      totals[:authors][author_name][:chars] += char_count
    end

    def normalize_author_name(raw_author)
      normalized = extract_normalized_author_name(raw_author)
      normalized == "" ? UNKNOWN_AUTHOR_NAME : normalized
    end

    def article_char_count(article)
      ArticleCharacterCounter.call(article[:content])
    end
  end
end
