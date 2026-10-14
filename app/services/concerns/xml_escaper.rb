module XmlEscaper
  INVALID_XML_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/.freeze

  private

  def escape_xml(value)
    value.to_s
      .gsub(INVALID_XML_CHARACTERS, "")
      .gsub("&", "&amp;")
      .gsub("<", "&lt;")
      .gsub(">", "&gt;")
      .gsub('"', "&quot;")
      .gsub("'", "&apos;")
  end
end
