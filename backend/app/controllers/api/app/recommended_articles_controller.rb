module Api
  module App
    class RecommendedArticlesController < ApiController
      def index
        render_json_result(RecommendedArticlesUsecase.call)
      end
    end
  end
end
