class AuthorPayloadBuilder
  def self.call(author:)
    new(author:).call
  end

  def initialize(author:)
    @author = author
  end

  def call
    id = author[:id].to_s
    name = author[:name].to_s
    return nil if id.empty? || name.empty?

    {
      id:,
      name:,
      title: author[:title],
      bio: author[:bio],
      imageUrl: extract_image_url
    }
  end

  private

  attr_reader :author

  def extract_image_url
    image = author[:icon] || author[:image] || author[:imageUrl] || author[:profileImage]
    return image if image.is_a?(String)
    return image[:url] if image.is_a?(Hash)

    nil
  end
end
