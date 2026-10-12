module Microcms
  module Users
    class FetchByUserIdService
      ENDPOINT = "https://masusono.microcms.io/api/v1/users".freeze

      def self.execute(user_id:, api_key: nil, faraday: nil)
        new(api_key: api_key, faraday: faraday).execute(user_id:)
      end

      def initialize(api_key: nil, faraday: nil)
        @client = Client.new(endpoint: self.class::ENDPOINT, api_key:, faraday:)
      end

      def execute(user_id:)
        first = client.fetch_content(content_id: Identity.content_id(user_id))
        user_hash(first)
      end

      private

      attr_reader :client

      def user_hash(first)
        return {} unless first.is_a?(Hash) && first.any?

        {
          id: first["id"],
          user_id: first["user_id"],
          name: first["name"]
        }
      end
    end
  end
end
