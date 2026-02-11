module App
  module MasudaRun
    class RankingsController < ApplicationController
      def index
        render json: RankingsIndexUsecase.call
      end
    end
  end
end
