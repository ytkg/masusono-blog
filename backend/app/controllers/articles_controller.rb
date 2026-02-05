class ArticlesController < ApplicationController
  def index
    client = Microcms::ArticlesClient.new
    response = client.response

    if response.success?
      render json: client.articles
    else
      content_type = response.headers["content-type"] || "application/json"
      render body: response.body, status: response.status, content_type: content_type
    end
  rescue StandardError => e
    Rails.logger.error("microCMS fetch failed: #{e.class}: #{e.message}")
    head :bad_gateway
  end
end
