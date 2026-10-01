InertiaRails.configure do |config|
  config.always_include_errors_hash = true
  config.parent_controller = "ApplicationController"
  config.use_script_element_for_initial_page = true
end

# Run after the watched-files patch and all other initializers. Production assets
# are immutable for this process, so requests can share the version computed here.
Rails.application.config.after_initialize do
  InertiaRails.configure do |config|
    config.version = Rails.env.production? ? ViteRuby.digest : "development"
  end
end
