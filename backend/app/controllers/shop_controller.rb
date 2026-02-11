class ShopController < WebController
  def index
    result = ShopIndexUsecase.call
    render inertia: true, props: result[:props], status: result[:status]
  end
end
