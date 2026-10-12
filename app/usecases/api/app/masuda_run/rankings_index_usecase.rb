module Api
  module App
    module MasudaRun
      class RankingsIndexUsecase
        FALLBACK_DISPLAY_NAME = "NO NAME".freeze
        RANKINGS_LIMIT = 10

        def self.call
          new.call
        end

        def call
          rankings_source = ::MasudaRunRanking.all(limit: RANKINGS_LIMIT)
          @users_by_id = fetch_users_by_id(rankings_source)
          ranked = rankings_source.map { |ranking| build_ranking(ranking) }
          rankings = ranked.map.with_index(1) do |ranking, index|
            build_response(ranking, index)
          end

          { json: rankings, status: :ok }
        end

        private

        def build_ranking(ranking)
          ranked_at = ranking[:createdAt]
          user_id = ranking[:user_id]

          {
            userId: user_id,
            name: resolve_display_name(user_id),
            score: ranking[:score],
            rankedAt: DateDisplayFormatter.format(ranked_at)
          }
        end

        def resolve_display_name(user_id)
          normalized_user_id = user_id.to_s.strip
          return FALLBACK_DISPLAY_NAME if normalized_user_id.empty?

          fetched_name = users_by_id.fetch(normalized_user_id, {})[:name].to_s.strip
          fetched_name.empty? ? normalized_user_id : fetched_name
        end

        def fetch_users_by_id(rankings)
          ::Microcms::Users::FetchByUserIdsService.execute(user_ids: rankings.map { |ranking| ranking[:user_id] })
        end

        def users_by_id
          @users_by_id ||= {}
        end

        def build_response(ranking, index)
          ranking.merge(rank: index)
        end
      end
    end
  end
end
