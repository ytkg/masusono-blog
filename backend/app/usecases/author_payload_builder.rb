class AuthorPayloadBuilder
  include AuthorNameExtractor

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
      imageUrl: extract_author_image_url(author)
    }
  end

  private

  attr_reader :author
end
