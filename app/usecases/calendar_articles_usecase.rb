class CalendarArticlesUsecase
  PUBLISHED_DATE_PATTERN = %r{\A\d{4}/\d{2}/\d{2}\z}

  def self.call
    articles = Article.all
    groups = ArticlePayloadBuilder.collection(articles)
      .select { |article| valid_published_date?(article[:publishedDate]) }
      .group_by { |article| article[:publishedDate][5..] }
      .sort.map do |month_day, entries|
        { monthDay: month_day, articles: entries }
      end

    { json: { groups: groups } }
  end

  def self.valid_published_date?(value)
    value.is_a?(String) && value.match?(PUBLISHED_DATE_PATTERN) && Date.valid_date?(*value.split("/").map(&:to_i))
  end
  private_class_method :valid_published_date?
end
