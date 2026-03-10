module Api
  module App
    module Numbers
      class MetricsController < ApiController
        def index
          result = ::Api::App::Numbers::MetricsIndexUsecase.call
          render_json_result(result)
        end
      end
    end
  end
end
