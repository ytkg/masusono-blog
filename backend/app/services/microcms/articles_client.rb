require "faraday"
require "json"

module Microcms
  class ArticlesClient
    MICROCMS_ARTICLES_ENDPOINT = "https://masusono.microcms.io/api/v1/articles".freeze

    def initialize(api_key: nil, faraday: nil)
      @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
      raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

      @faraday = faraday || Faraday.new do |f|
        f.options.timeout = 10
        f.options.open_timeout = 5
      end
    end

    def response
      @response ||= fetch_response
    end

    def fetch_response(limit: 100, offset: 0)
      faraday.get(microcms_uri(limit: limit, offset: offset)) do |req|
        req.headers["X-API-KEY"] = api_key
        req.headers["Accept"] = "application/json"
      end
    end

    def articles
      parse_articles(response.body)
    end

    def all_articles(response: nil)
      initial_response = response || fetch_response
      articles = parse_articles(initial_response.body)
      meta = parse_meta(initial_response.body)
      total_count = meta[:total_count]
      limit = meta[:limit]
      offset = meta[:offset]
      return articles unless total_count.is_a?(Integer) && limit.is_a?(Integer) && offset.is_a?(Integer)

      while offset + limit < total_count
        offset += limit
        res = fetch_response(limit: limit, offset: offset)
        articles.concat(parse_articles(res.body))
      end

      articles
    end

    def parse_articles(body)
      json = JSON.parse(body)
      contents = json["contents"]
      return [] unless contents.is_a?(Array)

      contents.map do |content|
        author = content["author"].is_a?(Hash) ? content["author"]["name"] : nil
        {
          "id" => content["id"],
          "publishedAt" => content["publishedAt"],
          "title" => content["title"],
          "content" => content["content"],
          "author" => author
        }
      end
    end

    def parse_meta(body)
      json = JSON.parse(body)
      {
        total_count: json["totalCount"],
        limit: json["limit"],
        offset: json["offset"]
      }
    rescue JSON::ParserError
      {}
    end

    private

    attr_reader :api_key, :faraday

    def microcms_uri(limit:, offset:)
      uri = URI(MICROCMS_ARTICLES_ENDPOINT)
      uri.query = URI.encode_www_form(limit: limit, offset: offset, orders: "-publishedAt")
      uri
    end
  end
end
