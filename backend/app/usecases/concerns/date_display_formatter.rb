require "time"

module DateDisplayFormatter
  module_function

  DATE_ONLY_PATTERN = /\A(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})\z/
  JST_OFFSET = "+09:00".freeze

  def format(value)
    return value if value.nil? || value == ""

    trimmed = value.to_s.strip
    return "" if trimmed == ""

    date_only_match = trimmed.match(DATE_ONLY_PATTERN)
    if date_only_match
      year, month, day = date_only_match.captures
      return format_ymd(year.to_i, month.to_i, day.to_i)
    end

    time = parse_time(trimmed)
    jst_time = time.getlocal(JST_OFFSET)
    format_ymd(jst_time.year, jst_time.month, jst_time.day)
  rescue ArgumentError, TypeError
    value
  end

  def parse_time(value)
    Time.iso8601(value)
  rescue ArgumentError
    Time.parse(value)
  end
  private_class_method :parse_time

  def format_ymd(year, month, day)
    Kernel.format("%04d/%02d/%02d", year, month, day)
  end
  private_class_method :format_ymd
end
