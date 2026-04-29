class Blog365Usecase
  TOKYO_TIME_ZONE = "Asia/Tokyo".freeze
  MONTH_FORMAT = "%-m月".freeze
  MONTH_DAY_FORMAT = "%-m月%-d日".freeze

  def self.call
    new.call
  end

  def call
    {
      props: {
        months: build_months
      },
      status: :ok
    }
  end

  private

  def build_months
    articles_by_month_day = Article.all.each_with_object(Hash.new { |hash, key| hash[key] = [] }) do |article, hash|
      month_day = extract_month_day(article[:publishedAt])
      next if month_day == "02-29"

      hash[month_day] << build_article(article)
    end

    build_year_days.group_by(&:month).map do |month, dates|
      days = dates.map do |date|
        month_day = date.strftime("%m-%d")

        {
          id: month_day,
          title: date.strftime(MONTH_DAY_FORMAT),
          articles: articles_by_month_day.fetch(month_day, [])
        }
      end

      {
        id: format("%02d", month),
        title: dates.first.strftime(MONTH_FORMAT),
        filledDaysCount: days.count { |day| day[:articles].any? },
        totalDaysCount: days.length,
        days: days
      }
    end
  end

  def build_year_days
    start_date = Date.new(2025, 1, 1)
    end_date = Date.new(2025, 12, 31)

    (start_date..end_date).reject { |date| date.month == 2 && date.day == 29 }
  end

  def extract_month_day(published_at)
    Time.iso8601(published_at.to_s).in_time_zone(TOKYO_TIME_ZONE).strftime("%m-%d")
  end

  def build_article(article)
    {
      id: article[:id],
      title: article[:title]
    }
  end
end
