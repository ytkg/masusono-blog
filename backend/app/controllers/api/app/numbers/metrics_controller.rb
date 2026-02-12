module Api
  module App
    module Numbers
      class MetricsController < ApiController
        def index
          result = ::Api::App::Numbers::MetricsIndexUsecase.call
          render json: result[:json], status: result[:status]
        end
      end
    end
  end
end
