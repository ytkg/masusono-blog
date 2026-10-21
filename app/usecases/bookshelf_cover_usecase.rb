class BookshelfCoverUsecase
  def self.call(isbn:)
    { json: { cover: Bookshelf::Cover.call(isbn.to_s) } }
  end
end
