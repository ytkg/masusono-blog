Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up", to: "rails/health#show", as: :rails_health_check

  inertia "/" => :home, as: :root
  inertia "about" => :about
  inertia "settings" => :settings
  inertia "zukan" => :zukan
  mount ActionCable.server => "/cable"
  get "numbers", to: "numbers#index"
  get "blog", to: "blog#index"
  get "blog/365", to: "blog#three_sixty_five"
  get "blog/:article_id", to: "blog#show"
  namespace :api do
    namespace :app do
      resources :users, only: %i[show create], param: :user_id, defaults: { format: :json }

      namespace :numbers do
        resources :metrics, only: :index
      end
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
