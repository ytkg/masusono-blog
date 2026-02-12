module Api
  module App
    module MasudaRun
      class RankingsController < ApiController
        def index
          result = ::Api::App::MasudaRun::RankingsIndexUsecase.call
          render json: result[:json], status: result[:status]
        end
      end
    end
  end
end
