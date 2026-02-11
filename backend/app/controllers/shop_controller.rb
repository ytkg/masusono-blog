class ShopController < WebController
  def index
    result = ShopIndexUsecase.call
    render inertia: "Shops", props: result[:props], status: result[:status]
  end
end
