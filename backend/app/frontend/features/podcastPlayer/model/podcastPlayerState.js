export const initialPodcastPlayerState = {
  status: "idle",
  error: null,
  isPlaying: false,
}

export function podcastPlayerReducer(state, action) {
  switch (action.type) {
    case "PLAY_REQUESTED":
      return {
        status: "loading",
        error: null,
        isPlaying: false,
      }
    case "PLAY_STARTED":
      return {
        status: "ready",
        error: null,
        isPlaying: true,
      }
    case "PLAY_PAUSED":
      return {
        ...state,
        isPlaying: false,
      }
    case "PLAY_ENDED":
      return {
        ...state,
        status: "ready",
        isPlaying: false,
      }
    case "BUFFERING_STARTED":
      return {
        ...state,
        status: "loading",
      }
    case "CAN_PLAY":
      return {
        ...state,
        status: "ready",
        error: null,
      }
    case "PLAY_FAILED":
      return {
        status: "error",
        error: action.error,
        isPlaying: false,
      }
    case "AUDIO_ERROR":
      return {
        status: "error",
        error: action.error,
        isPlaying: false,
      }
    case "STOPPED":
      return initialPodcastPlayerState
    default:
      return state
  }
}
