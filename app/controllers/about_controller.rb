class AboutController < ApplicationController
  def index
    render_inertia_result(AboutIndexUsecase.call, component: "about")
  end
end
