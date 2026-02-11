class PodcastController < WebController
  def index
    result = PodcastsIndexUsecase.call
    render inertia: "Podcast", props: { episodes: result[:podcasts] }
  end

  def show
    episode = PodcastsShowUsecase.call(episode_id: params[:episode_id])

    if episode
      render inertia: "PodcastDetail", props: { episode: episode }
    else
      render inertia: "PodcastDetail", props: { episode: nil }, status: :not_found
    end
  end
end
