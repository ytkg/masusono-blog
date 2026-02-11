class PodcastController < WebController
  def index
    result = PodcastIndexUsecase.call
    render inertia: "Podcast", props: result[:props], status: result[:status]
  end

  def show
    result = PodcastShowUsecase.call(episode_id: params[:episode_id])
    render inertia: "PodcastDetail", props: result[:props], status: result[:status]
  end
end
