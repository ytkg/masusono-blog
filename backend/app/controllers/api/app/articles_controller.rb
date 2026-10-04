module Api
  module App
    class ArticlesController < ApiController
      rescue_from ArticlesPageQuery::InvalidOffset, with: :render_invalid_request

      def index
        render_json_result(ArticlesPageUsecase.call(offset: params.fetch(:offset, 0)))
      end
    end
  end
end
