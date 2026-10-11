module Numbers
  class AuthorRowsSorter
    PRIORITY_AUTHOR_KEYWORD = "増田"
    NAME_PART_PATTERN = /\d+|\D+/
    NUMERIC_PART_PATTERN = /\A\d+\z/

    def self.call(authors:)
      new.call(authors:)
    end

    def call(authors:)
      authors.sort_by do |name, _data|
        [ name.include?(PRIORITY_AUTHOR_KEYWORD) ? 0 : 1, natural_sort_key(name) ]
      end
    end

    private

    def natural_sort_key(name)
      name.scan(NAME_PART_PATTERN).map { |part| natural_sort_part(part) }
    end

    def natural_sort_part(part)
      part.match?(NUMERIC_PART_PATTERN) ? [ 1, part.to_i ] : [ 0, part ]
    end
  end
end
