InertiaRails.configure do |config|
  config.version = lambda do
    Rails.env.production? ? ViteRuby.digest : "development"
  end
  config.always_include_errors_hash = true
  config.parent_controller = "ApplicationController"
  config.use_script_element_for_initial_page = true
end
