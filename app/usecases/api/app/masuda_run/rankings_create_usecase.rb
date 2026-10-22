module Api
  module App
    module MasudaRun
      class RankingsCreateUsecase
        include ::RequiredUserId

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

          grant_points(user_id: user_id, score: normalized_score, ranking_id: created[:id])

          {
            json: {
              id: created[:id],
              userId: user_id,
              score: normalized_score
            }
          }
        end

        private

        def grant_points(user_id:, score:, ranking_id:)
          return if score.zero?

          ::PointsGrantService.execute(user_id: user_id, amount: score)
        rescue ::PointsGrantService::Error => error
          Rails.logger.warn(event: "masuda_run_points_grant_failed", ranking_id: ranking_id, error: error.message)
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
