module XmlEscaper
  private

  def escape_xml(value)
    value.to_s
      .gsub("&", "&amp;")
      .gsub("<", "&lt;")
      .gsub(">", "&gt;")
      .gsub('"', "&quot;")
      .gsub("'", "&apos;")
  end
end
