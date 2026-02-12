module Api
  module Blog
    class ArticlesController < ApiController
      def index
        result = ArticlesIndexUsecase.call
        render json: { articles: result[:articles] }, status: :ok
      end
    end
  end
end
