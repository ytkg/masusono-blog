Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up", to: "rails/health#show", as: :rails_health_check

  root "home#show"
  get "about", to: "about#show"
  get "blog", to: "blog#index"
  get "blog/:article_id", to: "blog#show", as: :blog_article
  get "podcast", to: "podcast#index"
  get "podcast/:episode_id", to: "podcast#show", as: :podcast_episode
  get "shop", to: "shop#index"

  scope module: :api do
    get "sitemap.xml", to: "sitemaps#index"
    resources :metrics, only: :index
    namespace :masuda_run do
      resources :rankings, only: :index
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
