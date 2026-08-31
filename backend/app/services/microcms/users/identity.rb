require "digest"

module Microcms
  module Users
    class Identity
      def self.normalize(user_id)
        user_id.to_s.strip
      end

      def self.content_id(user_id)
        normalized = normalize(user_id)
        raise ArgumentError, "user_id is required" if normalized.empty?

        "u-#{Digest::SHA256.hexdigest(normalized)[0, 32]}"
      end
    end
  end
end
