require "rails_helper"

RSpec.describe "Web routes", type: :routing do
  it "routes /api/blog/articles.json to api/blog/articles#index" do
    expect(get: "/api/blog/articles.json").to route_to("api/blog/articles#index", format: "json")
  end

  it "routes /api/podcast/episodes.json to api/podcast/episodes#index" do
    expect(get: "/api/podcast/episodes.json").to route_to("api/podcast/episodes#index", format: "json")
  end

  it "routes /api/shop/shops.json to api/shop/shops#index" do
    expect(get: "/api/shop/shops.json").to route_to("api/shop/shops#index", format: "json")
  end

  it "routes /api/app/masuda_run/rankings.json to api/app/masuda_run/rankings#index" do
    expect(get: "/api/app/masuda_run/rankings.json").to route_to("api/app/masuda_run/rankings#index", format: "json")
  end

  it "routes POST /api/app/masuda_run/rankings.json to api/app/masuda_run/rankings#create" do
    expect(post: "/api/app/masuda_run/rankings.json").to route_to("api/app/masuda_run/rankings#create", format: "json")
  end

  it "routes GET /api/app/users/:user_id.json to api/app/users#show" do
    expect(get: "/api/app/users/cookie-user.json").to route_to("api/app/users#show", user_id: "cookie-user", format: "json")
  end

  it "routes POST /api/app/users.json to api/app/users#create" do
    expect(post: "/api/app/users.json").to route_to("api/app/users#create", format: "json")
  end
end
