module MasudaRun
  class RankingsIndexUsecase
    def self.call
      new.call
    end

    def call
      ranked = MasudaRunRanking.all.map { |ranking| build_ranking(ranking) }
      sorted = sort_rankings(ranked)

      sorted.map.with_index(1) do |ranking, index|
        build_response(ranking, index)
      end
    end

    private

    def build_ranking(ranking)
      ranked_at = ranking[:createdAt]

      {
        userId: ranking[:user_id],
        score: ranking[:score],
        rankedAt: PublishedAtFormatter.format(ranked_at),
        rankedAtEpoch: ranked_at_epoch(ranked_at)
      }
    end

    def sort_rankings(rankings)
      rankings.sort_by { |ranking| [ -ranking[:score], -ranking[:rankedAtEpoch] ] }
    end

    def build_response(ranking, index)
      ranking.except(:rankedAtEpoch).merge(rank: index)
    end

    def ranked_at_epoch(raw)
      return 0 if raw.nil?

      Time.iso8601(raw).to_i
    rescue ArgumentError
      0
    end
  end
end
