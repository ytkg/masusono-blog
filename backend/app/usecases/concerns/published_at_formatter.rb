require "time"

module PublishedAtFormatter
  module_function

  def format(value)
    return value if value.nil? || value == ""

    trimmed = value.to_s.strip
    return "" if trimmed == ""

    date_prefix_match = trimmed.match(/\A(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:\z|[T\s].*)/)
    if date_prefix_match
      year, month, day = date_prefix_match.captures
      return format_ymd(year.to_i, month.to_i, day.to_i)
    end

    time = Time.parse(trimmed)
    format_ymd(time.year, time.month, time.day)
  rescue ArgumentError, TypeError
    value
  end

  def format_ymd(year, month, day)
    Kernel.format("%04d/%02d/%02d", year, month, day)
  end
  private_class_method :format_ymd
end
