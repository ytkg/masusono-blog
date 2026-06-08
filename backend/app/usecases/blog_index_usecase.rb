class BlogIndexUsecase
  include AuthorNameExtractor

  READING_CHARS_PER_MINUTE = 400

  def self.call
    new.call
  end

  def call
    {
      props: {
        articles: Article.all.map { |article| build_article(article) }
      },
      status: :ok
    }
  end

  private

  def build_article(article)
    character_count = Numbers::ArticleCharacterCounter.call(article[:content])

    {
      id: article[:id],
      title: article[:title],
      publishedDate: DateDisplayFormatter.format(article[:publishedAt]),
      content: article[:content],
      tags: article[:tags],
      characterCount: character_count,
      readingTimeMinutes: reading_time_minutes(character_count),
      author: extract_author_name(article[:author]),
      authorId: extract_author_id(article[:author]),
      authorImageUrl: extract_author_image_url(article[:author])
    }
  end

  def reading_time_minutes(character_count)
    return 0 unless character_count.positive?

    (character_count.to_f / READING_CHARS_PER_MINUTE).ceil
  end
end
