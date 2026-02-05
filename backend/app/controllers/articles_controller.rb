require "faraday"

class ArticlesController < ApplicationController
  MICROCMS_ARTICLES_ENDPOINT = "https://masusono.microcms.io/api/v1/articles".freeze

  def index
    response = microcms_response
    if response.success?
      render json: parse_articles(response.body)
    else
      content_type = response.headers["content-type"] || "application/json"
      render body: response.body, status: response.status, content_type: content_type
    end
  rescue StandardError => e
    Rails.logger.error("microCMS fetch failed: #{e.class}: #{e.message}")
    head :bad_gateway
  end

  private

  def microcms_response
    faraday.get(microcms_uri) do |req|
      req.headers["X-API-KEY"] = microcms_api_key
      req.headers["Accept"] = "application/json"
    end
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

  def microcms_uri
    @microcms_uri ||= begin
      uri = URI(MICROCMS_ARTICLES_ENDPOINT)
      uri.query = URI.encode_www_form(limit: 100, orders: "-publishedAt")
      uri
    end
  end

  def microcms_api_key
    key = Rails.application.credentials.dig(:microcms, :api_key)
    raise "MICROCMS api key is missing (credentials: microcms.api_key)" if key.nil? || key.empty?

    key
  end

  def faraday
    @faraday ||= Faraday.new do |f|
      f.options.timeout = 10
      f.options.open_timeout = 5
    end
  end
end
