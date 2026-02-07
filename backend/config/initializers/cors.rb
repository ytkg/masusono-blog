# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    dev_origins = [
      %r{\Ahttp://localhost:\d+\z},
      %r{\Ahttp://127\.0\.0\.1:\d+\z}
    ]
    prod_origins = [
      "https://masusono.com",
      "https://static.masusono.com"
    ]

    origins(*(Rails.env.development? ? dev_origins + prod_origins : prod_origins))

    resource "*",
      headers: :any,
      methods: [ :get, :options, :head ]
  end
end
