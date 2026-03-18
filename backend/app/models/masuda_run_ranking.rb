class MasudaRunRanking
  def self.all(limit: nil)
    Microcms::MasudaRun::FetchRankingsService.execute(limit: limit)
  end

  def self.total_count
    Microcms::MasudaRun::FetchRankingsService.fetch_total_count
  end
end
