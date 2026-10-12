module Api
  module App
    module MasudaRun
      class RankingsController < ApiController
        rescue_from ArgumentError, with: :render_invalid_request

        def index
          result = ::Api::App::MasudaRun::RankingsIndexUsecase.call
          render_json_result(result)
        end

        def create
          result = ::Api::App::MasudaRun::RankingsCreateUsecase.call(
            score: params[:score],
            user_id: params[:userId]
          )

          render_json_result(result)
        end
      end
    end
  end
end
