export const ANONYMOUS_SURVEY_IDENTIFIER = JSON.stringify({ channel: "AnonymousSurveyChannel" })

export function buildCableUrl(location = window.location) {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${location.host}/cable`
}
