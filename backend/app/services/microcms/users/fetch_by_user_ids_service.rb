require "faraday"
require "json"
require "uri"

module Microcms
  module Users
    class FetchByUserIdsService
      ENDPOINT = "https://masusono.microcms.io/api/v1/users".freeze
      FETCH_LIMIT = 100

      def self.execute(user_ids:, api_key: nil, faraday: nil)
        new(api_key: api_key, faraday: faraday).execute(user_ids:)
      end

      def initialize(api_key: nil, faraday: nil)
        @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
        raise "MICROCMS api key is missing (credentials: microcms.api_key)" if @api_key.nil? || @api_key.empty?

        @faraday = faraday || Faraday.new do |f|
          f.options.timeout = 10
          f.options.open_timeout = 5
        end
      end

      def execute(user_ids:)
        normalized_user_ids = normalize_user_ids(user_ids)
        return {} if normalized_user_ids.empty?

        users_by_id = fetch_users_by_id(normalized_user_ids)
        fetch_missing_users(user_ids: normalized_user_ids, users_by_id:)
      end

      private

      attr_reader :api_key, :faraday

      def normalize_user_ids(user_ids)
        Array(user_ids).filter_map do |user_id|
          normalized = user_id.to_s.strip
          normalized unless normalized.empty?
        end.uniq
      end

      def raise_on_error!(response)
        return if response.success?

        raise Microcms::FetchContentsService::FetchError.new(status: response.status, body: response.body)
      end

      def fetch_users_by_id(user_ids, limit: FETCH_LIMIT)
        response = faraday.get(microcms_uri(user_ids: user_ids, limit:)) do |req|
          req.headers["X-API-KEY"] = api_key
          req.headers["Accept"] = "application/json"
        end

        raise_on_error!(response)
        parse_response(response.body)
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

      def microcms_uri(user_ids:, limit:)
        uri = URI(self.class::ENDPOINT)
        uri.query = URI.encode_www_form(limit: limit, filters: filters_for(user_ids))
        uri
      end

      def filters_for(user_ids)
        user_ids.map { |user_id| "user_id[equals]#{user_id}" }.join("[or]")
      end

      def parse_response(body)
        parsed = JSON.parse(body)
        Array(parsed["contents"]).each_with_object({}) do |content, users_by_id|
          next unless content.is_a?(Hash)

          user_id = content["user_id"].to_s.strip
          next if user_id.empty?

          users_by_id[user_id] = user_hash(content, user_id) if prefer_user?(content, users_by_id[user_id])
        end
      rescue JSON::ParserError
        {}
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
