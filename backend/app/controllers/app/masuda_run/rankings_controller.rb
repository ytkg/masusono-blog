module App
  module MasudaRun
    class RankingsController < ApiController
      def index
        result = RankingsIndexUsecase.call
        render json: result[:json], status: result[:status]
      end
    end
  end
end
