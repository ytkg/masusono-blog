class AuthorsIndexUsecase
  def self.call
    {
      props: {
        authors: Author.all.filter_map { |author| AuthorPayloadBuilder.call(author:) }
      }
    }
  end
end
