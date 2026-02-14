module Api
  module App
    module Users
      class ShowUsecase
        def self.call(user_id:)
          new.call(user_id:)
        end

        def call(user_id:)
          validate_user_id!(user_id)

          user = ::Microcms::Users::FetchByUserIdService.execute(user_id: user_id)

          {
            json: {
              userId: user_id,
              name: user[:name]
            },
            status: :ok
          }
        end

        private

        def validate_user_id!(user_id)
          return unless user_id.to_s.strip.empty?

          raise ArgumentError, "user_id is required"
        end
      end
    end
  end
end
