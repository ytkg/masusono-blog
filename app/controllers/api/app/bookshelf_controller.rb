module Api
  module App
    class BookshelfController < ApiController
      rescue_from Bookshelf::Cover::RateLimited do
        render_api_error(status: :service_unavailable, code: "upstream_rate_limited")
      end

      def index
        render_json_result(BookshelfIndexUsecase.call)
      end

      def cover
        render_json_result(BookshelfCoverUsecase.call(isbn: params[:isbn]))
      end
    end
  end
end
