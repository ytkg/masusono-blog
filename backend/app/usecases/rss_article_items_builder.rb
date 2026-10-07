class RssArticleItemsBuilder
  include AuthorNameExtractor

  def self.call(articles:, site_url:)
    new(site_url:).call(articles:)
  end

  def initialize(site_url:)
    @site_url = site_url
  end

  def call(articles:)
    articles.filter_map { |article| article_item(article) }
  end

  private

  attr_reader :site_url

  def article_item(article)
    id = article[:id]
    return if id.nil? || id == ""

    url = "#{site_url}/articles/#{id}"
    {
      title: article[:title],
      link: url,
      guid: url,
      published_at: article[:publishedAt],
      description: article[:content],
      author: extract_normalized_author_name(article[:author])
    }
  end
end
