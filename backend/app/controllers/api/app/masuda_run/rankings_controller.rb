module Api
  module App
    module MasudaRun
      class RankingsController < ApiController
        rescue_from ArgumentError, with: :render_invalid_request

        def index
          result = ::Api::App::MasudaRun::RankingsIndexUsecase.call
          render json: result[:json], status: result[:status]
        end

        def create
          result = ::Api::App::MasudaRun::RankingsCreateUsecase.call(
            score: params[:score],
            user_id: params[:userId]
          )

          render json: result[:json], status: result[:status]
        end
      end
    end
  end
end
