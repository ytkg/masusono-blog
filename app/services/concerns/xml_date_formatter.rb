require "time"

module XmlDateFormatter
  private

  def format_xml_date(value)
    return if value.nil? || value == ""

    CalendarDateValidator.validate!(value)
    yield Time.parse(value).utc
  rescue ArgumentError, TypeError
    nil
  end
end
