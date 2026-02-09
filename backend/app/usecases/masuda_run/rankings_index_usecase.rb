module MasudaRun
  class RankingsIndexUsecase
    def self.call
      new.call
    end

    def call
      ranked = MasudaRunRanking.all.map { |ranking| build_ranking(ranking) }
      ranked.map.with_index(1) do |ranking, index|
        build_response(ranking, index)
      end
    end

    private

    def build_ranking(ranking)
      ranked_at = ranking[:createdAt]

      {
        userId: ranking[:user_id],
        score: ranking[:score],
        rankedAt: PublishedAtFormatter.format(ranked_at)
      }
    end

    def build_response(ranking, index)
      ranking.merge(rank: index)
    end
  end
end
