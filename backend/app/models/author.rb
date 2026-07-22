class Author
  def self.all
    Microcms::FetchAuthorsService.execute
  end

  def self.find(id)
    return nil if id.nil? || id.empty?

    Microcms::FetchAuthorsService.execute(ids: id).first
  end
end
