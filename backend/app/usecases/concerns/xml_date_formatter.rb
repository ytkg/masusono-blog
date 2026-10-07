require "time"

module XmlDateFormatter
  private

  def format_xml_date(value)
    return nil if value.nil? || value == ""

    yield Time.parse(value).utc
  rescue ArgumentError, TypeError
    nil
  end
end
