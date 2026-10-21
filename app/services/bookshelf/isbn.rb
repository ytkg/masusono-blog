module Bookshelf
  module Isbn
    def self.from_asin(value)
      return unless value.is_a?(String) && value.match?(/\A[0-9]{9}[0-9X]\z/)
      digits = value.chars.map { |char| char == "X" ? 10 : char.to_i }
      return unless digits.each_with_index.sum { |digit, index| digit * (10 - index) } % 11 == 0

      base = "978#{value[0, 9]}"
      check = (10 - base.chars.each_with_index.sum { |digit, index| digit.to_i * (index.even? ? 1 : 3) } % 10) % 10
      "#{base}#{check}"
    end
  end
end
