module Admin
  class SessionsShowUsecase
    def self.call(session:)
      { json: { authenticated: AuthenticatedSession.valid?(session:) } }
    end
  end
end
