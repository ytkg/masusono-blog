module Api
  module App
    module Users
      class ShowUsecase
        include ::RequiredUserId

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
      end
    end
  end
end
