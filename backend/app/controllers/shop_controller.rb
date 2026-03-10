class ShopController < ApplicationController
  def index
    result = ShopIndexUsecase.call

    render_inertia_result(result)
  end
end
