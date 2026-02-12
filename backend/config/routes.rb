Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up", to: "rails/health#show", as: :rails_health_check

  inertia "/" => :home, as: :root
  inertia "about" => :about
  inertia :blog
  inertia "blog/:article_id" => :blog_detail
  inertia :podcast
  inertia :shop
  inertia "podcast/:episode_id" => :podcast_detail
  namespace :api do
    namespace :blog do
      resources :articles, only: :index, defaults: { format: :json }
    end
    namespace :podcast do
      resources :episodes, only: :index, defaults: { format: :json }
    end
    namespace :shop do
      resources :shops, only: :index, defaults: { format: :json }
    end
    namespace :app do
      namespace :numbers do
        resources :metrics, only: :index
      end
      namespace :masuda_run do
        resources :rankings, only: :index
      end
    end
  end

  get "sitemap.xml", to: "sitemaps#index"

  # Defines the root path route ("/")
  # root "posts#index"
end
