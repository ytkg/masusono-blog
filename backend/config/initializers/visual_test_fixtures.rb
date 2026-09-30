if Rails.env.development? && ENV["VISUAL_TEST"] == "1"
  require Rails.root.join("test/visual/fixtures")

  Rails.application.config.to_prepare do
    Article.singleton_class.prepend(VisualTestFixtures::Articles)
    Author.singleton_class.prepend(VisualTestFixtures::Authors)
    Numbers::MetricsIndexUsecase.singleton_class.prepend(VisualTestFixtures::Numbers)
    Api::App::MasudaRun::RankingsIndexUsecase.singleton_class.prepend(VisualTestFixtures::Rankings)
  end
end
