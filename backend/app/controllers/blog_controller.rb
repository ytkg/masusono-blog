class BlogController < ApplicationController
  def index
    redirect_to root_path
  end

  def three_sixty_five
    result = Blog365Usecase.call

    render_inertia_result(result)
  end

  def show
    result = BlogShowUsecase.call(article_id: params[:article_id])

    return render_inertia_not_found if result[:status] == :not_found

    render_inertia_result(result)
  end
end
