module Admin
  class MediaCreateUsecase
    def self.call(file:)
      { json: { media: Microcms::UploadMediaService.call(file:) } }
    end
  end
end
