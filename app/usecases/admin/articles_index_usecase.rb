module Admin
  class ArticlesIndexUsecase
    def self.call(query:, status:, page:)
      { props: Microcms::FetchManagedArticlesService.call(query:, status:, page:), status: :ok }
    end
  end
end
