class ShopController < WebController
  def index
    result = ShopsIndexUsecase.call
    render inertia: "Shops", props: { shops: result[:shops] }
  end
end
