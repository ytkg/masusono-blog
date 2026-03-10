class PodcastController < ApplicationController
  def index
    result = PodcastIndexUsecase.call

    render_inertia_result(result)
  end

  def show
    result = PodcastShowUsecase.call(episode_id: params[:episode_id])

    return render_inertia_not_found if result[:status] == :not_found

    render_inertia_result(result)
  end
end
