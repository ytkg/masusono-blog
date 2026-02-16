class BlogController < ApplicationController
  def index
    result = BlogIndexUsecase.call

    render inertia: { articles: result[:articles] }
  end

  def show
    result = BlogShowUsecase.call(article_id: params[:article_id])

    return render_inertia_not_found if result[:article].nil?

    render inertia: { article: result[:article] }
  end
end
