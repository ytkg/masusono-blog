module Microcms
  module Users
    class FetchAllService < Microcms::FetchContentsService
      ENDPOINT = "https://masusono.microcms.io/api/v1/users".freeze
    end
  end
end
