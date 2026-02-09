class MasudaRunRanking
  def self.all
    Microcms::MasudaRun::FetchRankingsService.execute
  end
end
