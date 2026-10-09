module Api
  module App
    class CalendarArticlesController < ApiController
      def index
        render_json_result(CalendarArticlesUsecase.call)
      end
    end
  end
end
