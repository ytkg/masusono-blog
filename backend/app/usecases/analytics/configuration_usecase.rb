module Analytics
  class ConfigurationUsecase
    UUID_PATTERN = /\A[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\z/i

    EXCLUDED_BROWSER_IDS = %w[1fa05d1c-e9d5-4fc7-b0d2-578bc6951e0c].freeze

    def self.call(browser_id)
      allowed = browser_id.to_s.match?(UUID_PATTERN) && !EXCLUDED_BROWSER_IDS.include?(browser_id)
      { status: :ok, json: { allowed: } }
    end
  end
end
