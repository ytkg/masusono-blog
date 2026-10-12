require "json"

module Webhooks
  module Microcms
    class ArticlesCreateUsecase
      def self.call(raw_payload:)
        payload = JSON.parse(raw_payload)
        return { article_missing: false } unless payload["api"] == "articles" && payload["type"] == "new" && payload["id"].present?

        article = Article.find(payload.fetch("id"))
        return { article_missing: true } unless article

        WebPush::ArticlePublishedNotifier.call(article:)
        { article_missing: false }
      end
    end
  end
end
