module Api
  module App
    class UsersController < ApiController
      rescue_from ArgumentError, with: :render_invalid_request

      def show
        result = ::Api::App::Users::ShowUsecase.call(user_id: params[:user_id])
        render_json_result(result)
      end

      def create
        result = ::Api::App::Users::CreateUsecase.call(
          name: params[:name],
          user_id: params[:userId]
        )

        render_json_result(result)
      end
    end
  end
end
