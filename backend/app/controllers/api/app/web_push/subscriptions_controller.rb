module Api
  module App
    module WebPush
      class SubscriptionsController < ApiController
        rescue_from ArgumentError, with: :render_invalid_request

        def create
          render_json_result(SubscriptionsCreateUsecase.call(subscription: params[:subscription]))
        end

        def destroy
          render_json_result(SubscriptionsDestroyUsecase.call(endpoint: params[:endpoint]))
        end
      end
    end
  end
end
