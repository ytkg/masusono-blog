module WebPush
  class ArticleNotificationPayload
    def self.call(article:)
      author_name = article.dig(:author, :name)
      title = author_name.blank? ? "新しい記事が公開されたよ" : "#{author_name}が新しい記事を書いたよ"

      { title:, body: article.fetch(:title), url: "/articles/#{article.fetch(:id)}" }
    end
  end
end
