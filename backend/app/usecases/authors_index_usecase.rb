class AuthorsIndexUsecase
  def self.call
    new.call
  end

  def call
    {
      props: {
        authors: Author.all.filter_map { |author| build_author(author) }
      },
      status: :ok
    }
  end

  private

  def build_author(author)
    id = author[:id].to_s
    name = author[:name].to_s
    return nil if id.empty? || name.empty?

    {
      id: id,
      name: name,
      title: author[:title],
      bio: author[:bio],
      imageUrl: extract_image_url(author)
    }
  end

  def extract_image_url(author)
    image = author[:icon] || author[:image] || author[:imageUrl] || author[:profileImage]
    return image if image.is_a?(String)
    return image[:url] if image.is_a?(Hash)

    nil
  end
end
