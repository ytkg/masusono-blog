module Microcms
  module MasudaRun
    class CreateRankingService
      ENDPOINT = "https://masusono.microcms.io/api/v1/masudarunkings".freeze

      def self.execute(user_id:, score:, api_key: nil, faraday: nil)
        CreateContentService.execute(
          endpoint: self::ENDPOINT,
          attributes: { user_id:, score: },
          api_key:,
          faraday:
        )
      end
    end
  end
end
