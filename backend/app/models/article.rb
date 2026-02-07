class Article
  class FetchError < StandardError
    def initialize(status:, body:)
      super("microCMS request failed: status=#{status}, body=#{body}")
    end
  end

  class << self
    def all
      client = Microcms::ArticlesClient.new
      response = client.response
      raise_on_error!(response)
      collect_all(client, response)
    end

    private

    def collect_all(client, initial_response)
      articles = client.parse_articles(initial_response.body)
      meta = client.parse_meta(initial_response.body)
      return articles unless pageable?(meta)

      fetch_remaining_pages(client, articles, meta)
    end

    def fetch_remaining_pages(client, articles, meta)
      total_count = meta[:total_count]
      limit = meta[:limit]
      offset = meta[:offset]

      while offset + limit < total_count
        offset += limit
        response = client.fetch_response(limit: limit, offset: offset)
        raise_on_error!(response)
        articles.concat(client.parse_articles(response.body))
      end

      articles
    end

    def pageable?(meta)
      meta[:total_count].is_a?(Integer) &&
        meta[:limit].is_a?(Integer) &&
        meta[:offset].is_a?(Integer)
    end

    def raise_on_error!(response)
      return if response.success?

      raise FetchError.new(status: response.status, body: response.body)
    end
  end
end
