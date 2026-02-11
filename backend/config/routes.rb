Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up", to: "rails/health#show", as: :rails_health_check

  inertia "/" => "home/show", as: :root
  inertia "about" => "about/show"
  get "blog", to: "blog#index"
  get "blog/:article_id", to: "blog#show", as: :blog_article
  get "podcast", to: "podcast#index"
  get "podcast/:episode_id", to: "podcast#show", as: :podcast_episode
  get "shop", to: "shop#index"

  scope module: :app, path: :app do
    namespace :numbers do
      resources :metrics, only: :index
    end
    namespace :masuda_run do
      resources :rankings, only: :index
    end
  end

  get "sitemap.xml", to: "sitemaps#index"

  # Defines the root path route ("/")
  # root "posts#index"
end
