module Api
  module Blog
    class ArticlesController < ApiController
      def index
        result = ::BlogIndexUsecase.call
        render json: { articles: result[:articles] }, status: :ok
      end
    end
  end
end
