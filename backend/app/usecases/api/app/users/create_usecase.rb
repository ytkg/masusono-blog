module Api
  module App
    module Users
      class CreateUsecase
        include ::RequiredUserId

        def self.call(name:, user_id:)
          new.call(name:, user_id:)
        end

        def call(name:, user_id:)
          validate_user_id!(user_id)
          normalized_name = normalize_name(name)

          created = ::Microcms::Users::CreateService.execute(
            user_id: user_id,
            name: normalized_name
          )

          {
            json: {
              id: created[:id],
              userId: user_id,
              name: normalized_name
            },
            status: :created
          }
        end

        private

        def normalize_name(name)
          normalized = name.to_s.strip
          return normalized unless normalized.empty?

          raise ArgumentError, "name is required"
        end
      end
    end
  end
end
