module Microcms
  module Users
    class CreateService
      ENDPOINT = "https://masusono.microcms.io/api/v1/users".freeze

      def self.execute(user_id:, name:, api_key: nil, faraday: nil)
        CreateContentService.execute(
          endpoint: self::ENDPOINT,
          attributes: { user_id:, name: },
          api_key:,
          faraday:
        )
      end
    end
  end
end
