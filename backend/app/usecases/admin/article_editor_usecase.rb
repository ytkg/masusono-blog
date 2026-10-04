module Admin
  class ArticleEditorUsecase
    def self.call(id:, attributes: nil, expected_revision: nil)
      service = Microcms::Articles::EditorService.new
      authors = Author.all.map { |author| { id: author[:id], name: author[:name] } }
      if attributes && attributes["author"].present? && authors.none? { |author| author[:id] == attributes["author"] }
        raise Microcms::Articles::EditorService::Error.new("invalid_request", "登録済みの著者を選択してください。", :unprocessable_content)
      end
      article = attributes ? service.update(id, attributes:, expected_revision:) : service.fetch(id)
      { props: { article:, authors: }, status: :ok }
    rescue Microcms::FetchContentsService::FetchError, Faraday::Error, JSON::ParserError
      raise Microcms::Articles::EditorService::Error.new("authors_unavailable", "著者を取得できません。時間をおいて再度お試しください。")
    end
  end
end
