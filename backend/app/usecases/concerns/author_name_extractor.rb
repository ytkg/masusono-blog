module AuthorNameExtractor
  private

  def extract_author_name(raw_author)
    raw_author.is_a?(Hash) ? raw_author[:name] : raw_author
  end

  def extract_normalized_author_name(raw_author)
    extract_author_name(raw_author).to_s.strip
  end
end
