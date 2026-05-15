module Microcms
  class FetchAuthorsService < FetchContentsService
    ENDPOINT = "https://masusono.microcms.io/api/v1/authors".freeze

    private

    def microcms_uri(limit:, offset:)
      uri = URI(self.class::ENDPOINT)
      uri.query = URI.encode_www_form(limit: limit, offset: offset, orders: "publishedAt")
      uri
    end
  end
end
