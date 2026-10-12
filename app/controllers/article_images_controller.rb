class ArticleImagesController < ApplicationController
  def show
    response.headers["Cache-Control"] = "no-store"
    result = ArticleImagesShowUsecase.call(article_id: params[:article_id], version: params[:version])
    return head :not_found unless result.fetch(:found)
    return redirect_to result[:redirect_path], status: :temporary_redirect if result[:redirect_path]

    send_data result.fetch(:image), type: "image/png", disposition: "inline"
  rescue Microcms::FetchContentsService::FetchError, Faraday::Error
    head :service_unavailable
  end
end
