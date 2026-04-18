require "securerandom"

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user_id

    def connect
      self.current_user_id = cookies[:user_id].presence || SecureRandom.uuid
    end
  end
end
