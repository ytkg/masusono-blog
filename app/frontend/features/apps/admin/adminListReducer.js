export const initialAdminListState = {
  items: [],
  page: 1,
  hasMore: false,
  nextToken: null,
  totalCount: 0,
  loading: false,
  loadingMore: false,
  error: null,
}

export function adminListReducer(state, action) {
  switch (action.type) {
    case "reset":
      return {
        ...state,
        items: [],
        hasMore: false,
        nextToken: null,
        totalCount: action.resetTotalCount ? 0 : state.totalCount,
        loading: true,
        loadingMore: false,
        error: null,
      }
    case "loaded":
      return {
        ...state,
        items: action.append ? [...state.items, ...action.items] : action.items,
        page: action.result.page,
        hasMore: action.result.has_more,
        nextToken: action.result.next_token ?? null,
        totalCount: action.append ? state.totalCount : action.result.total_count,
      }
    case "moreStarted":
      return { ...state, loadingMore: true, error: null }
    case "failed":
      return { ...state, error: action.message }
    case "initialFinished":
      return { ...state, loading: false }
    case "moreFinished":
      return { ...state, loadingMore: false }
    default:
      return state
  }
}
