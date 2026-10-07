class SitemapsIndexUsecase
  CONTENT_TYPE = "application/xml; charset=utf-8".freeze
  BASE_URL = "https://masusono.com".freeze
  BLOG_ENTRY = SitemapEntriesBuilder::BLOG_ENTRY
  STATIC_ENTRIES = SitemapEntriesBuilder::STATIC_ENTRIES

  def self.call
    new.call
  end

  def call
    {
      body: build_sitemap_xml(articles: Article.all, authors: Author.all),
      content_type: CONTENT_TYPE,
      status: :ok
    }
  end

  private

  def build_sitemap_xml(articles:, authors:)
    entries = SitemapEntriesBuilder.call(articles:, authors:, base_url: BASE_URL)
    SitemapXmlBuilder.call(entries)
  end
end
