class ArticleImagesController < ApplicationController
  def show
    # Verify current publication before reading cached bytes, including old URLs.
    response.headers["Cache-Control"] = "no-store"
    article = Article.find(params[:article_id])
    return head :not_found unless article

    unless params[:version] == ArticleOgpImage.version(article:)
      return redirect_to ArticleOgpImage.path(article:), status: :temporary_redirect
    end

    send_data ArticleOgpImage.call(article:), type: "image/png", disposition: "inline"
  rescue Microcms::FetchContentsService::FetchError, Faraday::Error
    head :service_unavailable
  end
end
