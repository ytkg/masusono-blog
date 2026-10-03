// Keep line boundaries here; each consumer decides how to normalize whitespace.
export function extractHtmlText(html = "") {
  const source = String(html ?? "")
  if (!/[<&]/.test(source)) return source

  // A detached template keeps body images inert until the article is expanded.
  const template = document.createElement("template")
  template.innerHTML = source
  appendLineBoundaries(template.content)
  return template.content.textContent ?? ""
}

export function extractTextFromHtml(html) {
  return extractHtmlText(html).replace(/\s+/g, " ").trim()
}

function appendLineBoundaries(fragment) {
  fragment.querySelectorAll("br").forEach((element) => element.replaceWith("\n"))
  fragment.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, li").forEach((element) => element.append("\n"))
}
