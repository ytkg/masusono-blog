module XmlEscaper
  XML_ESCAPES = { "&" => "&amp;", "<" => "&lt;", ">" => "&gt;", '"' => "&quot;", "'" => "&apos;" }.freeze

  private

  def escape_xml(value)
    value.to_s.gsub(/[&<>"']/, XML_ESCAPES)
  end
end
