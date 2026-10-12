class SearchController < ApplicationController
  def index
    result = SearchIndexUsecase.call

    render_inertia_result(result, component: "search")
  end
end
