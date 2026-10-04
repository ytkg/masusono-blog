InertiaRails.configure do |config|
  config.always_include_errors_hash = true
  config.parent_controller = "ApplicationController"
  config.use_script_element_for_initial_page = true
  # Puma evaluates this without a controller when managing the SSR process.
  config.ssr_enabled = -> {
    !Rails.env.test? && (!respond_to?(:request) || request.path.match?(%r{\A(?:/|/about|/authors(?:/[^/]+)?|/articles/[^/]+)\z}))
  }
  config.ssr_url ||= "http://127.0.0.1:13714" if Rails.env.production?
  config.ssr_bundle = Rails.root.join("ssr/ssr.mjs").to_s
end

# Run after the watched-files patch and all other initializers. Production assets
# are immutable for this process, so requests can share the version computed here.
Rails.application.config.after_initialize do
  InertiaRails.configure do |config|
    config.version = Rails.env.production? ? ViteRuby.digest : "development"
  end
end
