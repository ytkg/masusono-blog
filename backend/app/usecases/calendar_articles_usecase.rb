class CalendarArticlesUsecase
  def self.call
    articles = Article.all
    groups = ArticlePayloadBuilder.collection(articles)
      .select { |article| article[:publishedDate].to_s.match?(%r{\A\d{4}/\d{2}/\d{2}\z}) }
      .group_by { |article| article[:publishedDate][5..] }
      .sort.map do |month_day, entries|
        { monthDay: month_day, articles: entries }
      end

    { json: { groups: groups }, status: :ok }
  end
end
