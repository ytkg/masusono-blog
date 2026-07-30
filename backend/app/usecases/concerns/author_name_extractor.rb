module AuthorNameExtractor
  private

  def extract_author_name(raw_author)
    raw_author.is_a?(Hash) ? raw_author[:name] : raw_author
  end

  def extract_author_id(raw_author)
    raw_author.is_a?(Hash) ? raw_author[:id] : nil
  end

  def extract_author_image_url(raw_author)
    return nil unless raw_author.is_a?(Hash)

    image = raw_author[:icon] || raw_author[:image] || raw_author[:imageUrl] || raw_author[:profileImage]
    url = image if image.is_a?(String)
    url = image[:url] if image.is_a?(Hash)

    AuthorImageUrlOptimizer.call(url)
  end

  def extract_normalized_author_name(raw_author)
    extract_author_name(raw_author).to_s.strip
  end
end
