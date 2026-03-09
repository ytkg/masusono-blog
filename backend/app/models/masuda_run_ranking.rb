class MasudaRunRanking
  def self.all(limit: nil)
    Microcms::MasudaRun::FetchRankingsService.execute(limit: limit)
  end
end
