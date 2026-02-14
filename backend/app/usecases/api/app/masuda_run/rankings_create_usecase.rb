module Api
  module App
    module MasudaRun
      class RankingsCreateUsecase
        def self.call(score:, user_id:)
          new.call(score:, user_id:)
        end

        def call(score:, user_id:)
          validate_user_id!(user_id)
          normalized_score = normalize_score(score)

          created = ::Microcms::MasudaRun::CreateRankingService.execute(
            user_id: user_id,
            score: normalized_score
          )

          {
            json: {
              id: created[:id],
              userId: user_id,
              score: normalized_score
            },
            status: :created
          }
        end

        private

        def validate_user_id!(user_id)
          return unless user_id.to_s.strip.empty?

          raise ArgumentError, "user_id is required"
        end

        def normalize_score(score)
          normalized = Integer(score, exception: false)
          return normalized if normalized && normalized >= 0

          raise ArgumentError, "score must be a non-negative integer"
        end
      end
    end
  end
end
