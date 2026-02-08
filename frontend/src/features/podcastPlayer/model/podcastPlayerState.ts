export type PodcastPlayerStatus = "idle" | "loading" | "ready" | "error"

export interface PodcastPlayerState {
  status: PodcastPlayerStatus
  error: string | null
  isPlaying: boolean
}

export type PodcastPlayerAction =
  | { type: "PLAY_REQUESTED" }
  | { type: "PLAY_STARTED" }
  | { type: "PLAY_PAUSED" }
  | { type: "PLAY_ENDED" }
  | { type: "BUFFERING_STARTED" }
  | { type: "CAN_PLAY" }
  | { type: "PLAY_FAILED"; error: string }
  | { type: "AUDIO_ERROR"; error: string }
  | { type: "STOPPED" }

export const initialPodcastPlayerState: PodcastPlayerState = {
  status: "idle",
  error: null,
  isPlaying: false,
}

export function podcastPlayerReducer(state: PodcastPlayerState, action: PodcastPlayerAction): PodcastPlayerState {
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
    default: {
      const exhaustiveCheck: never = action
      return exhaustiveCheck
    }
  }
}
