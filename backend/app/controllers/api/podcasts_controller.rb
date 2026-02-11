module Api
  class PodcastsController < ApplicationController
    def index
      result = PodcastsIndexUsecase.call
      render json: result[:podcasts]
    end
  end
end
