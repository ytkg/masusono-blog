module Api
  module App
    module MasudaTataki
      class PointsCreateUsecase
        def self.call(score:, user_id:)
          unless user_id.is_a?(String) && user_id.strip.length.between?(1, 200)
            raise ArgumentError, "userId must contain 1 to 200 characters"
          end

          amount = Integer(score, exception: false) if score.is_a?(Integer) || score.is_a?(String)
          unless amount && amount.between?(0, ::PointsGrantService::MAX_AMOUNT)
            raise ArgumentError, "score must be a non-negative safe integer"
          end

          ::PointsGrantService.execute(user_id: user_id, amount: amount) if amount.positive?
          { json: { userId: user_id, score: amount } }
        end
      end
    end
  end
end
