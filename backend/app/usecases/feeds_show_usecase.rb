class FeedsShowUsecase
  include AuthorNameExtractor

  CONTENT_TYPE = "application/rss+xml; charset=utf-8".freeze
  SITE_TITLE = "増田とその他！".freeze
  SITE_URL = "https://masusono.com".freeze
  SITE_DESCRIPTION =
    "増田とその他！の公式サイト。ブログやミニゲームなど増田周辺の最新コンテンツをまとめてチェックできます。".freeze
  FEED_URL = "#{SITE_URL}/feed.xml".freeze

  def self.call
    new.call
  end

  def call
    {
      body: build_rss_xml(Article.all),
      content_type: CONTENT_TYPE,
      status: :ok
    }
  end

  private

  def build_rss_xml(articles)
    RssXmlBuilder.call(
      title: SITE_TITLE,
      link: SITE_URL,
      description: SITE_DESCRIPTION,
      feed_url: FEED_URL,
      items: article_items(articles)
    )
  end

  def article_items(articles)
    articles.filter_map do |article|
      id = article[:id]
      next if id.nil? || id == ""

      url = "#{SITE_URL}/articles/#{id}"
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
end
