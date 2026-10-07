class FeedsShowUsecase
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
      items: RssArticleItemsBuilder.call(articles:, site_url: SITE_URL)
    )
  end
end
