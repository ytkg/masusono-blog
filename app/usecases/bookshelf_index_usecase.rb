class BookshelfIndexUsecase
  def self.call
    { json: Bookshelf::Catalog.call }
  end
end
