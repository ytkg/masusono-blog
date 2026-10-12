class NumbersController < ApplicationController
  def index
    result = NumbersIndexUsecase.call

    render_inertia_result(result)
  end
end
