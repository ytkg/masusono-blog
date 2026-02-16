module Api
  module Shop
    class ShopsController < ApiController
      def index
        result = ::ShopIndexUsecase.call
        render json: { shops: result[:shops] }, status: :ok
      end
    end
  end
end
