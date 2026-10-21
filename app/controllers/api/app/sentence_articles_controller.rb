module Api
  module App
    class SentenceArticlesController < ApiController
      def index
        render_json_result(SentenceArticlesUsecase.call)
      end
    end
  end
end
