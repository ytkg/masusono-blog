class AuthorsIndexUsecase
  def self.call
    new.call
  end

  def call
    {
      props: {
        authors: Author.all.filter_map { |author| AuthorPayloadBuilder.call(author:) }
      },
      status: :ok
    }
  end
end
