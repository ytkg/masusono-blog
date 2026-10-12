class OthersController < ApplicationController
  def index
    render_inertia_result(OthersIndexUsecase.call, component: "others/index")
  end
end
