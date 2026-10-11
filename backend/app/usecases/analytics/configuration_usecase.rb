module Analytics
  class ConfigurationUsecase
    UUID_PATTERN = /\A[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\z/i

    def self.call(browser_id)
      excluded_ids = ENV.fetch("GA4_EXCLUDED_BROWSER_IDS", "").split(/[\s,]+/)
      allowed = browser_id.to_s.match?(UUID_PATTERN) && !excluded_ids.include?(browser_id)
      { status: :ok, json: { allowed: } }
    end
  end
end
