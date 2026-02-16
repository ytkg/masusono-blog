class ShopController < ApplicationController
  def index
    result = ShopIndexUsecase.call

    render inertia: { shops: result[:shops] }
  end
end
