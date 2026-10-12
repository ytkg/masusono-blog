module Admin
  class SessionsController < BaseController
    skip_before_action :require_admin

    def show
      render json: { authenticated: AuthenticatedSession.valid?(session:), csrf_token: form_authenticity_token }
    rescue AuthClient::Error
      render_admin_error(status: :bad_gateway, code: "auth_unavailable", message: "認証サービスに接続できません。")
    end

    def create
      tokens = AuthClient.new.login(username: params[:username].to_s, password: params[:password].to_s)
      unless tokens
        render_admin_error(status: :unauthorized, code: "invalid_credentials", message: "ユーザー名またはパスワードが正しくありません。")
        return
      end

      reset_session
      AuthenticatedSession.start(session:, tokens:)
      render json: { authenticated: true, csrf_token: form_authenticity_token }
    rescue AuthClient::Error
      render_admin_error(status: :bad_gateway, code: "auth_unavailable", message: "認証サービスに接続できません。")
    end
  end
end
