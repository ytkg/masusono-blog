// Keep line boundaries here; each consumer decides how to normalize whitespace.
export function extractHtmlText(html = "") {
  const source = String(html ?? "")
  if (!/[<&]/.test(source)) return source

  const template = document.createElement("template")
  template.innerHTML = source
  template.content.querySelectorAll("br").forEach((element) => element.replaceWith("\n"))
  template.content.querySelectorAll("p, div, h1, h2, h3, h4, h5, h6, li").forEach((element) => element.append("\n"))
  return template.content.textContent ?? ""
}

export function extractTextFromHtml(html) {
  return extractHtmlText(html).replace(/\s+/g, " ").trim()
}
