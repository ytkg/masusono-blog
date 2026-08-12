class HomeController < ApplicationController
  def index
    result = BlogIndexUsecase.call

    render_inertia_result(result, component: "home")
  end
end
