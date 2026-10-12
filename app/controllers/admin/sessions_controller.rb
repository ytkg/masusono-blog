module Admin
  class SessionsController < BaseController
    skip_before_action :require_admin

    def show
      result = SessionsShowUsecase.call(session:)
      render json: result.fetch(:json).merge(csrf_token: form_authenticity_token)
    rescue AuthClient::Error
      render_admin_error(status: :bad_gateway, code: "auth_unavailable", message: "認証サービスに接続できません。")
    end

    def create
      result = SessionsCreateUsecase.call(username: params[:username].to_s, password: params[:password].to_s)
      unless result.fetch(:tokens)
        render_admin_error(status: :unauthorized, code: "invalid_credentials", message: "ユーザー名またはパスワードが正しくありません。")
        return
      end

      reset_session
      AuthenticatedSession.start(session:, tokens: result.fetch(:tokens))
      render json: result.fetch(:json).merge(csrf_token: form_authenticity_token)
    rescue AuthClient::Error
      render_admin_error(status: :bad_gateway, code: "auth_unavailable", message: "認証サービスに接続できません。")
    end
  end
end
