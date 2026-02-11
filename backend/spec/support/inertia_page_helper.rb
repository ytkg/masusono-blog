require "cgi"
require "json"

module InertiaPageHelper
  def inertia_page
    encoded_data = response.body[/data-page="([^"]+)"/, 1]
    raise "Inertia data-page is missing from response body." if encoded_data.nil?

    JSON.parse(CGI.unescapeHTML(encoded_data))
  end
end

RSpec.configure do |config|
  config.include InertiaPageHelper, type: :request
end
