class CalendarArticlesUsecase
  PUBLISHED_DATE_PATTERN = %r{\A\d{4}/\d{2}/\d{2}\z}

  def self.call
    articles = Article.all
    groups = ArticlePayloadBuilder.collection(articles)
      .select { |article| article[:publishedDate].to_s.match?(PUBLISHED_DATE_PATTERN) }
      .group_by { |article| article[:publishedDate][5..] }
      .sort.map do |month_day, entries|
        { monthDay: month_day, articles: entries }
      end

    { json: { groups: groups }, status: :ok }
  end
end
