module App
  module Numbers
    class MetricsController < ApplicationController
      def index
        result = MetricsIndexUsecase.call
        render json: result[:json], status: result[:status]
      end
    end
  end
end
