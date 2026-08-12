import ArticlesList from "./ArticlesList"
import SentenceFeed from "./SentenceFeed"

// Home-only features are registered here. Removing a tab is intentionally a
// one-entry change; Home itself only handles generic tab selection and history.
export const HOME_TABS = Object.freeze([
  {
    id: "feed",
    label: "フィード",
    renderContent: ({ articles }) => (
      <ArticlesList articles={articles} emptyMessage="記事がありません。" />
    ),
  },
  {
    id: "beginnings",
    label: "書き出し",
    renderContent: ({ articles }) => <SentenceFeed articles={articles} />,
  },
])

export const DEFAULT_HOME_TAB_ID = HOME_TABS[0].id

export function isHomeTabId(id) {
  return HOME_TABS.some((tab) => tab.id === id)
}
