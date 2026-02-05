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
      @response ||= faraday.get(microcms_uri) do |req|
        req.headers["X-API-KEY"] = api_key
        req.headers["Accept"] = "application/json"
      end
    end

    def articles
      parse_articles(response.body)
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
          "author" => author,
        }
      end
    end

    private

    attr_reader :api_key, :faraday

    def microcms_uri
      @microcms_uri ||= begin
        uri = URI(MICROCMS_ARTICLES_ENDPOINT)
        uri.query = URI.encode_www_form(limit: 100, orders: "-publishedAt")
        uri
      end
    end
  end
end
