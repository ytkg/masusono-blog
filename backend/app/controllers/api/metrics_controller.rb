module Api
  class MetricsController < ApplicationController
    def index
      result = MetricsIndexUsecase.call
      render json: result[:metrics]
    end
  end
end
