module Admin
  class MediaController < BaseController
    def index
      result = MediaIndexUsecase.call(query: params[:q].to_s.strip, page: params[:page].presence || 1)

      if request.format.json?
        render json: result.fetch(:props), status: result.fetch(:status)
      else
        render_inertia_result(result, component: "admin/media")
      end
    rescue ArgumentError
      head :bad_request
    rescue Microcms::FetchMediaService::FetchError
      render plain: "メディアを取得できません。時間をおいて再度お試しください。", status: :bad_gateway
    end
  end
end
