module Api
  module Shop
    class ShopsController < ApiController
      def index
        result = ShopsIndexUsecase.call
        render json: { shops: result[:shops] }, status: :ok
      end
    end
  end
end
