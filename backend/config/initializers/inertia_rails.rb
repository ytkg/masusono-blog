InertiaRails.configure do |config|
  config.version = lambda { ViteRuby.digest }
  config.always_include_errors_hash = true
  config.parent_controller = "ApplicationController"
end
