class ShopController < ApplicationController
  def index
    result = ShopIndexUsecase.call
    inertia_render(result)
  end
end
