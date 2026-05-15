class AuthorsController < ApplicationController
  def index
    render_inertia_result(AuthorsIndexUsecase.call)
  end

  def show
    result = AuthorShowUsecase.call(author_id: params[:author_id])

    return render_inertia_not_found if result[:status] == :not_found

    render_inertia_result(result)
  end
end
