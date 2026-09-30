module Admin
  class AuthenticatedSession
    MAX_AGE = 7.days

    def self.start(session:, tokens:)
      session[:admin_auth] = tokens.merge("expires_at" => MAX_AGE.from_now.to_i)
    end

    def self.valid?(session:, client: AuthClient.new)
      auth = session[:admin_auth]
      return false unless auth.is_a?(Hash)

      if auth["expires_at"].to_i <= Time.current.to_i
        session.delete(:admin_auth)
        return false
      end

      return true if client.verify(access_token: auth["access_token"])

      tokens = client.refresh(refresh_token: auth["refresh_token"])
      return clear(session) unless tokens

      session[:admin_auth] = auth.merge(tokens)
      return true if client.verify(access_token: tokens["access_token"])

      clear(session)
    end

    def self.clear(session)
      session.delete(:admin_auth)
      false
    end
  end
end
