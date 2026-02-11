module Api
  module MasudaRun
    class RankingsController < ApplicationController
      def index
        rankings = ::MasudaRun::RankingsIndexUsecase.call
        render json: rankings
      end
    end
  end
end
