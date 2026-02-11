class PodcastController < ApplicationController
  def index
    result = PodcastIndexUsecase.call
    inertia_render(result)
  end

  def show
    result = PodcastShowUsecase.call(episode_id: params[:episode_id])
    inertia_render(result)
  end
end
