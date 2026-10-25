if ENV["COVERAGE"] == "true"
  require "simplecov"
  SimpleCov.start "rails" do
    coverage_dir "coverage/ruby"
    track_files "{app,lib}/**/*.rb"
  end
end

ENV["RAILS_ENV"] = "test"
require_relative "../config/environment"
abort("The Rails environment is running in production mode!") if Rails.env.production?

require "spec_helper"
require "rspec/rails"
require "inertia_rails/rspec"

Dir[Rails.root.join("spec/support/**/*.rb")].sort.each { |file| require file }

RSpec.configure do |config|
  config.filter_rails_from_backtrace!
end
