class YearAgoArticlesBuilder
  def self.call(article:)
    date = published_time(article[:publishedAt])&.to_date
    return [] unless date
    return [] if date.month == 2 && date.day == 29

    target = Date.new(date.year - 1, date.month, date.day)
    matching_candidates(article:, target:).sort_by { |candidate, time| [ -time, candidate[:id] ] }
                                         .map { |candidate, _time| candidate.slice(:id, :title) }
  rescue Microcms::FetchContentsService::FetchError, Faraday::Error, JSON::ParserError => error
    Rails.logger.warn("Year ago articles fetch failed: #{error.class.name}")
    []
  end

  def self.matching_candidates(article:, target:)
    Article.fetch_by_filter(date_filters(target)).uniq { |candidate| candidate[:id] }.filter_map do |candidate|
      candidate_match(candidate, article:, target:)
    end
  end
  private_class_method :matching_candidates

  def self.candidate_match(candidate, article:, target:)
    return if candidate[:id].blank? || candidate[:id] == article[:id]

    time = published_time(candidate[:publishedAt])
    return unless time&.to_date == target

    [ candidate, time.to_f ]
  end
  private_class_method :candidate_match

  def self.date_filters(target)
    start_time = Time.new(target.year, target.month, target.day, 0, 0, 0, "+09:00").utc
    # microCMS's greater_than is exclusive; include midnight with a millisecond margin.
    "publishedAt[greater_than]#{(start_time - Rational(1, 1000)).iso8601(3)}" \
      "[and]publishedAt[less_than]#{(start_time + 1.day).iso8601(3)}"
  end
  private_class_method :date_filters

  def self.published_time(value)
    Time.iso8601(value).getlocal("+09:00") if value.present?
  rescue ArgumentError, TypeError
    nil
  end
  private_class_method :published_time
end
