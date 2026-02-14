module Api
  module App
    class UsersController < ApiController
      rescue_from ArgumentError, with: :render_invalid_request

      def show
        result = ::Api::App::Users::ShowUsecase.call(user_id: params[:user_id])
        render json: result[:json], status: result[:status]
      end

      def create
        result = ::Api::App::Users::CreateUsecase.call(
          name: params[:name],
          user_id: params[:userId]
        )

        render json: result[:json], status: result[:status]
      end
    end
  end
end
