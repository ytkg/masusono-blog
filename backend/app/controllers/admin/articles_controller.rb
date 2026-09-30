module Admin
  class ArticlesController < BaseController
    def index
      result = ArticlesIndexUsecase.call(
        query: params[:q].to_s.strip,
        status: params[:status].presence || "all",
        page: params[:page].presence || 1
      )

      render json: result.fetch(:props), status: result.fetch(:status)
    rescue ArgumentError
      render_admin_error(status: :bad_request, code: "invalid_request", message: "検索条件が正しくありません。")
    rescue Microcms::FetchManagedArticlesService::FetchError
      render_admin_error(status: :bad_gateway, code: "articles_unavailable", message: "記事を取得できません。時間をおいて再度お試しください。")
    end
  end
end
