class HomeController < ApplicationController
  def index
    result = HomeIndexUsecase.call

    render_inertia_result(result, component: "home")
  end
end
