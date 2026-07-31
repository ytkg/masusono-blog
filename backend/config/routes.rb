Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up", to: "rails/health#show", as: :rails_health_check

  root "home#index"
  inertia "about" => :about
  inertia "others" => "others/index"
  get "search", to: "search#index"
  get "authors", to: "authors#index"
  get "zukan", to: redirect("/authors")
  get "numbers", to: "numbers#index"
  get "authors/:author_id", to: "authors#show"
  get "articles/:article_id", to: "blog#show"
  get "blog", to: "blog#index"
  constraints(lambda { |request| request.path_parameters[:article_id] != "365" }) do
    get "blog/:article_id", to: redirect("/articles/%{article_id}")
  end
  namespace :api do
    namespace :app do
      resources :users, only: %i[show create], param: :user_id, defaults: { format: :json }

      namespace :masuda_run do
        resources :rankings, only: %i[index create]
      end
    end
  end

  get "sitemap.xml", to: "sitemaps#index"
  get "feed.xml", to: "feeds#show"

  # Defines the root path route ("/")
  # root "posts#index"
end
