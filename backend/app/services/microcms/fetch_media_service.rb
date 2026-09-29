require "faraday"
require "json"

module Microcms
  class FetchMediaService
    BASE_URL = "https://masusono.microcms-management.io/".freeze
    PAGE_SIZE = 50
    MAX_PAGE = 200
    class FetchError < StandardError; end

    def self.call(query:, page:, connection: nil, api_key: nil)
      new(connection:, api_key:).call(query:, page:)
    end

    def initialize(connection: nil, api_key: nil)
      @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
      raise FetchError, "microCMS API key is missing" if @api_key.blank?

      @connection = connection || Faraday.new(url: BASE_URL) do |client|
        client.options.open_timeout = 5
        client.options.timeout = 10
      end
    end

    def call(query:, page:)
      page_number = Integer(page, exception: false)
      raise ArgumentError, "Invalid page" unless page_number && page_number.between?(1, MAX_PAGE)

      token = nil
      result = nil
      page_number.times do |index|
        params = index.zero? ? { limit: PAGE_SIZE, fileName: query.presence } : { token: token }
        response = @connection.get("api/v2/media", params.compact) do |request|
          request.headers["X-MICROCMS-API-KEY"] = @api_key
        end
        raise FetchError, "microCMS media request failed" unless response.success?

        result = JSON.parse(response.body)
        token = result["token"]
        if index < page_number - 1 && token.blank?
          return { media: [], total_count: result["totalCount"].to_i, has_more: false, page: page_number, query: query }
        end
      end

      media = Array(result["media"]).map do |item|
        item.slice("id", "url", "width", "height", "createdAt", "updatedAt", "alt", "tags")
      end
      {
        media: media,
        total_count: result["totalCount"].to_i,
        has_more: token.present? && page_number * PAGE_SIZE < result["totalCount"].to_i,
        page: page_number,
        query: query
      }
    rescue JSON::ParserError, Faraday::Error => error
      raise FetchError, "microCMS media request failed", cause: error
    end
  end
end
