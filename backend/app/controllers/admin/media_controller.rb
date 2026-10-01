module Admin
  class MediaController < BaseController
    def index
      result = MediaIndexUsecase.call(query: params[:q].to_s.strip, page: params[:page].presence || 1, cursor: params[:token])

      render json: result.fetch(:props), status: result.fetch(:status)
    rescue ArgumentError
      render_admin_error(status: :bad_request, code: "invalid_request", message: "検索条件が正しくありません。")
    rescue Microcms::FetchMediaService::FetchError
      render_admin_error(status: :bad_gateway, code: "media_unavailable", message: "メディアを取得できません。時間をおいて再度お試しください。")
    end

    def create
      media = Microcms::UploadMediaService.call(file: params[:file])

      render json: { media: }, status: :created
    rescue Microcms::UploadMediaService::ValidationError => error
      render_admin_error(status: :unprocessable_content, code: error.code, message: error.message)
    rescue Microcms::UploadMediaService::UploadError
      render_admin_error(status: :bad_gateway, code: "media_upload_failed", message: "画像をアップロードできませんでした。時間をおいて再度お試しください。")
    end
  end
end
