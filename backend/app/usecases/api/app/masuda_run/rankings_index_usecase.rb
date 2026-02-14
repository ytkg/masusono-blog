module Api
  module App
    module MasudaRun
      class RankingsIndexUsecase
        FALLBACK_DISPLAY_NAME = "NO NAME".freeze

        def self.call
          new.call
        end

        def call
          ranked = ::MasudaRunRanking.all.map { |ranking| build_ranking(ranking) }
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
            rankedAt: PublishedAtFormatter.format(ranked_at)
          }
        end

        def resolve_display_name(user_id)
          normalized_user_id = user_id.to_s.strip
          return FALLBACK_DISPLAY_NAME if normalized_user_id.empty?

          user_name_by_id[normalized_user_id] ||= begin
            fetched = ::Microcms::Users::FetchByUserIdService.execute(user_id: normalized_user_id)
            fetched_name = fetched[:name].to_s.strip
            fetched_name.empty? ? normalized_user_id : fetched_name
          end
        end

        def user_name_by_id
          @user_name_by_id ||= {}
        end

        def build_response(ranking, index)
          ranking.merge(rank: index)
        end
      end
    end
  end
end
