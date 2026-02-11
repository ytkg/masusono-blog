class BlogController < ApplicationController
  def index
    result = BlogIndexUsecase.call
    inertia_render(result)
  end

  def show
    result = BlogShowUsecase.call(article_id: params[:article_id])
    inertia_render(result)
  end
end
