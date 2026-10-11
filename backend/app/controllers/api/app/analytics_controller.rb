module Api
  module App
    class AnalyticsController < ApiController
      def show
        render_json_result(Analytics::ConfigurationUsecase.call(cookies[:user_id]))
      end
    end
  end
end
