module Microcms
  module Users
    class FetchByUserIdsService
      ENDPOINT = "https://masusono.microcms.io/api/v1/users".freeze
      FETCH_LIMIT = 100

      def self.execute(user_ids:, api_key: nil, faraday: nil)
        new(api_key: api_key, faraday: faraday).execute(user_ids:)
      end

      def initialize(api_key: nil, faraday: nil)
        @client = Client.new(endpoint: self.class::ENDPOINT, api_key:, faraday:)
      end

      def execute(user_ids:)
        normalized_user_ids = normalize_user_ids(user_ids)
        return {} if normalized_user_ids.empty?

        users_by_id = fetch_users_by_id(normalized_user_ids)
        fetch_missing_users(user_ids: normalized_user_ids, users_by_id:)
      end

      private

      attr_reader :client

      def normalize_user_ids(user_ids)
        Array(user_ids).filter_map do |user_id|
          normalized = user_id.to_s.strip
          normalized unless normalized.empty?
        end.uniq
      end

      def fetch_users_by_id(user_ids, limit: FETCH_LIMIT)
        contents = client.fetch_contents(filters: filters_for(user_ids), limit:)
        users_by_id_from(contents)
      end

      def fetch_missing_users(user_ids:, users_by_id:)
        (user_ids - users_by_id.keys).each do |user_id|
          users_by_id[user_id] = fetch_user_by_id(user_id)
        end

        users_by_id
      end

      def fetch_user_by_id(user_id)
        fetch_users_by_id([ user_id ], limit: 1).fetch(user_id, {})
      end

      def filters_for(user_ids)
        user_ids.map { |user_id| "user_id[equals]#{user_id}" }.join("[or]")
      end

      def users_by_id_from(contents)
        contents.each_with_object({}) do |content, users_by_id|
          next unless content.is_a?(Hash)

          user_id = content["user_id"].to_s.strip
          next if user_id.empty?

          users_by_id[user_id] = user_hash(content, user_id) if prefer_user?(content, users_by_id[user_id])
        end
      end

      def prefer_user?(content, current_user)
        current_user.nil? || (current_user[:name].to_s.strip.empty? && !content["name"].to_s.strip.empty?)
      end

      def user_hash(content, user_id)
        {
          id: content["id"],
          user_id: user_id,
          name: content["name"]
        }
      end
    end
  end
end
