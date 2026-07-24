class HomeController < ApplicationController
  def index
    result = BlogIndexUsecase.call

    render inertia: "home", props: result.fetch(:props), status: result.fetch(:status)
  end
end
