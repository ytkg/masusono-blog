module Admin
  class BaseController < ApplicationController
    before_action :require_admin
    after_action :disable_cache

    private

    def require_admin
      return if AuthenticatedSession.valid?(session:)

      render_admin_error(status: :unauthorized, code: "unauthorized", message: "ログインが必要です。")
    rescue AuthClient::Error
      render_admin_error(status: :bad_gateway, code: "auth_unavailable", message: "認証サービスに接続できません。")
    end

    def render_admin_error(status:, code:, message:)
      disable_cache
      render json: { error: { code:, message:, request_id: request.request_id } }, status:
    end

    def disable_cache
      response.headers["Cache-Control"] = "no-store"
      response.headers["X-Robots-Tag"] = "noindex, nofollow"
    end
  end
end
