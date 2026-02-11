require "rails_helper"

RSpec.describe "Web routes", type: :routing do
  it "routes / to home#show" do
    expect(get: "/").to route_to("home#show")
  end

  it "routes /about to about#show" do
    expect(get: "/about").to route_to("about#show")
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
end
