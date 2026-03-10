require "rails_helper"

RSpec.describe "Web routes", type: :routing do
  it "routes /up to rails/health#show" do
    expect(get: "/up").to route_to("rails/health#show")
  end

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

  it "routes /api/app/numbers/metrics.json to api/app/numbers/metrics#index" do
    expect(get: "/api/app/numbers/metrics.json").to route_to("api/app/numbers/metrics#index", format: "json")
  end

  it "routes /sitemap.xml to sitemaps#index" do
    expect(get: "/sitemap.xml").to route_to("sitemaps#index")
  end
end
