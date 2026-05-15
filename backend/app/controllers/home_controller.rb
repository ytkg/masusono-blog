class HomeController < ApplicationController
  def index
    result = HomeIndexUsecase.call

    render inertia: "home", props: result.fetch(:props), status: result.fetch(:status)
  end
end
