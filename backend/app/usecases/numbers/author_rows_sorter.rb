module Numbers
  class AuthorRowsSorter
    PRIORITY_AUTHOR_KEYWORD = "増田"

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
      name.scan(/\d+|\D+/).map { |part| natural_sort_part(part) }
    end

    def natural_sort_part(part)
      part.match?(/\A\d+\z/) ? [ 1, part.to_i ] : [ 0, part ]
    end
  end
end
