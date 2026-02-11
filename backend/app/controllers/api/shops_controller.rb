module Api
  class ShopsController < ApplicationController
    def index
      result = ShopsIndexUsecase.call
      render json: result[:shops]
    end
  end
end
