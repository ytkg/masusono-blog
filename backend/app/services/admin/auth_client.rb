require "faraday"
require "json"

module Admin
  class AuthClient
    BASE_URL = "https://auth.takagi.dev/".freeze
    class Error < StandardError; end

    def initialize(connection: nil)
      @connection = connection || Faraday.new(url: BASE_URL) do |client|
        client.options.open_timeout = 5
        client.options.timeout = 10
      end
    end

    def login(username:, password:)
      token_response(@connection.post("login", { username:, password: }.to_json, json_headers))
    end

    def refresh(refresh_token:)
      token_response(@connection.post("refresh", { refreshToken: refresh_token }.to_json, json_headers))
    end

    def verify(access_token:)
      response = @connection.get("verify") do |request|
        request.headers["Authorization"] = "Bearer #{access_token}"
      end

      return true if response.status == 200
      return false if response.status == 401

      raise Error, "Authentication service is unavailable"
    rescue Faraday::Error => error
      raise Error, "Authentication service is unavailable", cause: error
    end

    private

    def json_headers
      { "Content-Type" => "application/json", "Accept" => "application/json" }
    end

    def token_response(response)
      return nil if response.status == 401
      raise Error, "Authentication service is unavailable" unless response.status == 200

      body = JSON.parse(response.body)
      access_token = body["accessToken"] || body["token"]
      refresh_token = body["refreshToken"]
      raise Error, "Invalid authentication response" unless access_token.is_a?(String) && access_token.present? &&
                                                         refresh_token.is_a?(String) && refresh_token.present?

      { "access_token" => access_token, "refresh_token" => refresh_token }
    rescue JSON::ParserError => error
      raise Error, "Invalid authentication response", cause: error
    rescue Faraday::Error => error
      raise Error, "Authentication service is unavailable", cause: error
    end
  end
end
