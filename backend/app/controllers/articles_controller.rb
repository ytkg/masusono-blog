class ArticlesController < ApplicationController
  include MicrocmsResponseHandling

  def index
    response = microcms_client.response
    return render_microcms_error(response) unless response.success?

    render json: microcms_client.articles
  rescue StandardError => e
    log_microcms_error("microCMS fetch failed", e)
    head :bad_gateway
  end
end
