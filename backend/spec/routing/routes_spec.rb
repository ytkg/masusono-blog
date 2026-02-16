require "rails_helper"

RSpec.describe "Web routes", type: :routing do
  it "routes /blog to blog#index" do
    expect(get: "/blog").to route_to("blog#index")
  end

  it "routes /blog/:article_id to blog#show" do
    expect(get: "/blog/article-1").to route_to("blog#show", article_id: "article-1")
  end

  it "routes /podcast to podcast#index" do
    expect(get: "/podcast").to route_to("podcast#index")
  end

  it "routes /podcast/:episode_id to podcast#show" do
    expect(get: "/podcast/001").to route_to("podcast#show", episode_id: "001")
  end

  it "routes /shop to shop#index" do
    expect(get: "/shop").to route_to("shop#index")
  end

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
