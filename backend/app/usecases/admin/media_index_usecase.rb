module Admin
  class MediaIndexUsecase
    def self.call(query:, page:)
      { props: Microcms::FetchMediaService.call(query:, page:), status: :ok }
    end
  end
end
