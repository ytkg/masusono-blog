class ApplicationController < ActionController::API
  DEFAULT_CACHE_MAX_AGE = 1.hour

  before_action :set_default_cache_headers

  private

  def set_default_cache_headers
    return unless request.get? || request.head?

    expires_in DEFAULT_CACHE_MAX_AGE, public: true, must_revalidate: true
  end
end
