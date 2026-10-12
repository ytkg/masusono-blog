module Api
  module App
    module WebPush
      class VapidPublicKeyUsecase
        def self.call
          new.call
        end

        def call
          public_key = Rails.application.credentials.dig(:web_push, :vapid_public_key).to_s.strip
          raise "web_push.vapid_public_key is missing" if public_key.empty?

          { json: { publicKey: public_key }, status: :ok }
        end
      end
    end
  end
end
