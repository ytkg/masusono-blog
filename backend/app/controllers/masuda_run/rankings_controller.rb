module MasudaRun
  class RankingsController < ApplicationController
    def index
      rankings = RankingsIndexUsecase.call
      render json: rankings
    end
  end
end
