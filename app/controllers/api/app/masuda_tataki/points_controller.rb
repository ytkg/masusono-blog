module Api
  module App
    module MasudaTataki
      class PointsController < ApiController
        rescue_from ArgumentError, with: :render_invalid_request
        rescue_from PointsGrantService::Error, with: :render_points_error

        def create
          result = PointsCreateUsecase.call(score: params[:score], user_id: params[:userId])
          render_json_result(result, status: :created)
        end

        private

        def render_points_error(_error)
          render_api_error(status: :bad_gateway, code: "upstream_error")
        end
      end
    end
  end
end
