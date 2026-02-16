class PodcastController < ApplicationController
  def index
    result = PodcastIndexUsecase.call

    render inertia: { episodes: result[:episodes] }
  end

  def show
    result = PodcastShowUsecase.call(episode_id: params[:episode_id])

    return render_inertia_not_found if result[:episode].nil?

    render inertia: { episode: result[:episode] }
  end
end
