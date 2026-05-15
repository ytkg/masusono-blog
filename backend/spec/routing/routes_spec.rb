require "rails_helper"

RSpec.describe "Web routes", type: :routing do
  it "routes /up to rails/health#show" do
    expect(get: "/up").to route_to("rails/health#show")
  end

  it "routes / to home#index" do
    expect(get: "/").to route_to("home#index")
  end

  it "routes /blog to blog#index" do
    expect(get: "/blog").to route_to("blog#index")
  end

  it "routes /numbers to numbers#index" do
    expect(get: "/numbers").to route_to("numbers#index")
  end

  it "routes /authors/:author_id to authors#show" do
    expect(get: "/authors/9wgrey2lh3").to route_to("authors#show", author_id: "9wgrey2lh3")
  end

  it "routes /blog/365 to blog#three_sixty_five" do
    expect(get: "/blog/365").to route_to("blog#three_sixty_five")
  end

  it "routes /articles/:article_id to blog#show" do
    expect(get: "/articles/article-1").to route_to("blog#show", article_id: "article-1")
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

  it "routes /sitemap.xml to sitemaps#index" do
    expect(get: "/sitemap.xml").to route_to("sitemaps#index")
  end

  it "routes /feed.xml to feeds#show" do
    expect(get: "/feed.xml").to route_to("feeds#show")
  end
end
