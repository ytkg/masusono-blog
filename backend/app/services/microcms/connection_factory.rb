require "faraday"

module Microcms
  class ConnectionFactory
    def self.build(**options)
      Faraday.new(**options) do |connection|
        connection.options.timeout = 10
        connection.options.open_timeout = 5
      end
    end
  end
end
