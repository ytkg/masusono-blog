module Admin
  class SessionsController < ApplicationController
    after_action :disable_cache

    def new
      render inertia: "admin/login", props: { error: nil, csrfToken: form_authenticity_token }
    end

    def create
      tokens = AuthClient.new.login(username: params[:username].to_s, password: params[:password].to_s)
      unless tokens
        render inertia: "admin/login", props: { error: "ユーザー名またはパスワードが正しくありません。", csrfToken: form_authenticity_token }, status: :unauthorized
        return
      end

      reset_session
      AuthenticatedSession.start(session:, tokens:)
      redirect_to admin_root_path
    rescue AuthClient::Error
      render inertia: "admin/login", props: { error: "認証サービスに接続できません。", csrfToken: form_authenticity_token }, status: :bad_gateway
    end

    private

    def disable_cache
      response.cache_control.clear
      response.cache_control[:no_store] = true
      response.headers["X-Robots-Tag"] = "noindex, nofollow"
    end
  end
end
