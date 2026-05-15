class AuthorShowUsecase
  def self.call(author_id:)
    new(author_id: author_id).call
  end

  def initialize(author_id:)
    @author_id = author_id
  end

  def call
    author = AuthorsIndexUsecase.call.dig(:props, :authors).to_a.find { |item| item[:id] == @author_id }
    return { props: { author: nil, articles: [] }, status: :not_found } if author.nil?

    articles = BlogIndexUsecase.call.dig(:props, :articles).to_a.select do |article|
      article[:authorId] == author.fetch(:id)
    end

    {
      props: {
        author: author,
        articles: articles
      },
      status: :ok
    }
  end
end
