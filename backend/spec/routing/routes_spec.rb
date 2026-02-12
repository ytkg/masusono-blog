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
end
