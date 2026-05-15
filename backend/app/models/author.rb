class Author
  def self.all
    Microcms::FetchAuthorsService.execute
  end
end
