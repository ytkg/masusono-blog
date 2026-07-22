module Microcms
  class FetchAuthorsService < FetchContentsService
    ENDPOINT = "https://masusono.microcms.io/api/v1/authors".freeze

    private

    def query_params(limit:, offset:)
      super.merge(orders: "publishedAt")
    end
  end
end
