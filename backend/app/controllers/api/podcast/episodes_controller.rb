module Api
  module Podcast
    class EpisodesController < ApiController
      def index
        result = ::PodcastIndexUsecase.call
        render json: { episodes: result[:episodes] }, status: :ok
      end
    end
  end
end
