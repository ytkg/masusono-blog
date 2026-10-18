require "date"

module CalendarDateValidator
  def self.validate!(value)
    date_parts = Date._parse(value).values_at(:year, :mon, :mday)
    raise ArgumentError, "Invalid calendar date" if date_parts.all? && !Date.valid_date?(*date_parts)
  end
end
