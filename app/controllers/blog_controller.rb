class BlogController < ApplicationController
  def index
    redirect_to BlogIndexUsecase.call.fetch(:redirect_path)
  end

  def show
    result = BlogShowUsecase.call(article_id: params[:article_id])

    return render_inertia_not_found if result.fetch(:props).fetch(:article).nil?

    render_inertia_result(result)
  end
end
