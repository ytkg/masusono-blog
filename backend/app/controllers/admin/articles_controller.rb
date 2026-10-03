module Admin
  class ArticlesController < BaseController
    def show
      render_editor
    end

    def update
      render_editor(attributes: params.require(:article).permit(:title, :content, :author, :publishedAt).to_h, expected_revision: params[:revision])
    rescue ActionController::ParameterMissing
      render_admin_error(status: :bad_request, code: "invalid_request", message: "編集内容を指定してください。")
    end

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

    private

    def render_editor(**options)
      result = ArticleEditorUsecase.call(id: params[:id], **options)
      render json: result.fetch(:props), status: result.fetch(:status)
    rescue Microcms::Articles::EditorService::Error => error
      render_admin_error(status: error.status, code: error.code, message: error.message)
    end
  end
end
