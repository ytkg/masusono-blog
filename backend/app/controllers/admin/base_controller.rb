module Admin
  class BaseController < ApplicationController
    before_action :require_admin
    after_action :disable_cache

    private

    def require_admin
      return if AuthenticatedSession.valid?(session:)

      redirect_to admin_login_path
    rescue AuthClient::Error
      render plain: "認証サービスに接続できません。時間をおいて再度お試しください。", status: :bad_gateway
    end

    def disable_cache
      response.cache_control.clear
      response.cache_control[:no_store] = true
      response.headers["X-Robots-Tag"] = "noindex, nofollow"
    end
  end
end
