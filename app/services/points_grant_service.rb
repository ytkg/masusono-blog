require "faraday"
require "json"

class PointsGrantService
  ENDPOINT = "https://ads.masusono.com/api/points/grant"
  MAX_AMOUNT = 9_007_199_254_740_991

  class Error < StandardError; end

  def self.execute(user_id:, amount:)
    unless user_id.is_a?(String) && user_id.strip.length.between?(1, 200)
      raise Error, "user_id must contain 1 to 200 characters"
    end
    unless amount.is_a?(Integer) && amount.between?(1, MAX_AMOUNT)
      raise Error, "amount must be a positive safe integer"
    end

    connection = Faraday.new do |client|
      client.options.timeout = 3
      client.options.open_timeout = 2
    end
    # shortcut: no idempotency support upstream; add retries only after that is available.
    response = connection.post(ENDPOINT) do |request|
      request.headers["Content-Type"] = "application/json"
      request.body = JSON.generate(userId: user_id, amount: amount)
    end
    raise Error, "Points grant failed (status=#{response.status})" unless response.success?

    nil
  rescue Faraday::Error => error
    raise Error, "Points grant failed (#{error.class})"
  end
end
