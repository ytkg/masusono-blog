module App
  module Numbers
    class MetricsController < ApplicationController
      def index
        render json: MetricsIndexUsecase.call[:metrics]
      end
    end
  end
end
