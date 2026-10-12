class SearchController < ApplicationController
  def index
    result = BlogIndexUsecase.call

    render_inertia_result(result, component: "search")
  end
end
