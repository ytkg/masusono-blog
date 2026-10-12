module Admin
  class SessionsCreateUsecase
    def self.call(username:, password:)
      tokens = AuthClient.new.login(username:, password:)
      { tokens:, json: { authenticated: tokens.present? } }
    end
  end
end
