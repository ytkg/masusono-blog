module Admin
  class MediaIndexUsecase
    def self.call(query:, page:, cursor: nil)
      { props: Microcms::FetchMediaService.call(query:, page:, cursor:) }
    end
  end
end
