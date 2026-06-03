class SearchController < ApplicationController
  def index
    result = BlogIndexUsecase.call

    render inertia: "search", props: result.fetch(:props), status: result.fetch(:status)
  end
end
