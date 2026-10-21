require "rails_helper"

RSpec.describe "Bookshelf", type: :request do
  let(:article) { { id: "book-article", title: "記事", publishedAt: "2026-01-01T00:00:00Z", content: '<a href="https://amazon.co.jp/dp/4101010013">本</a>' } }
  let(:summary) { { isbn: "9784101010014", title: "吾輩は猫である", author: "夏目, 漱石, 1867-1916" } }

  before do
    stub_microcms_get(endpoint: Microcms::FetchArticlesService::ENDPOINT, query: { limit: "100", offset: "0", orders: "-publishedAt" }, contents: [ article ])
    stub_request(:get, Bookshelf::Catalog::ENDPOINT).with(query: { isbn: "9784101010014" }).to_return(body: [ { summary: summary } ].to_json)
  end

  it "returns exact source text with article links and no-store" do
    get "/api/app/bookshelf"
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to eq("books" => [ { "isbn" => "9784101010014", "title" => summary[:title], "author" => summary[:author], "amazonUrl" => "https://www.amazon.co.jp/dp/4101010013", "articles" => [ { "id" => "book-article", "title" => "記事", "publishedAt" => "2026-01-01T00:00:00Z" } ] } ], "partial" => false)
    expect(response.headers["Cache-Control"]).to include("no-store")
  end

  it "fetches beyond the first 10 and 100 articles with the public microCMS endpoint" do
    url = Microcms::FetchArticlesService::ENDPOINT
    stub_request(:get, url).with(query: { limit: "100", offset: "0", orders: "-publishedAt" }).to_return(body: { contents: 100.times.map { |i| { id: "plain-#{i}", content: "本文" } }, totalCount: 101, limit: 100, offset: 0 }.to_json)
    stub_request(:get, url).with(query: { limit: "100", offset: "100", orders: "-publishedAt" }).to_return(body: { contents: [ article ], totalCount: 101, limit: 100, offset: 100 }.to_json)
    get "/api/app/bookshelf"
    expect(response.parsed_body.fetch("books").size).to eq(1)
  end

  context "metadata is absent" do
    let(:summary) { { isbn: "9784101010014", title: "吾輩は猫である", author: "" } }

    it "returns a normal empty shelf" do
      get "/api/app/bookshelf"
      expect(response.parsed_body).to eq("books" => [], "partial" => false)
    end
  end

  context "metadata is another edition" do
    let(:summary) { { isbn: "9780804429573", title: "別版", author: "著者" } }

    it "does not substitute the edition" do
      get "/api/app/bookshelf"
      expect(response.parsed_body.fetch("books")).to be_empty
    end
  end

  it "distinguishes a failed lookup from no books and succeeds on the next launch" do
    stub_request(:get, Bookshelf::Catalog::ENDPOINT).with(query: { isbn: "9784101010014" }).to_return(status: 429).then.to_return(body: [ { summary: summary } ].to_json)
    get "/api/app/bookshelf"
    expect(response).to have_http_status(:bad_gateway)
    expect(response.parsed_body.dig("error", "request_id")).to be_present
    expect(response.headers["Cache-Control"]).to include("no-store")
    get "/api/app/bookshelf"
    expect(response.parsed_body.fetch("books").size).to eq(1)
  end

  it "treats malformed metadata as a communication failure rather than an empty shelf" do
    stub_request(:get, Bookshelf::Catalog::ENDPOINT).with(query: { isbn: "9784101010014" }).to_return(body: "{broken")
    get "/api/app/bookshelf"
    expect(response).to have_http_status(:bad_gateway)
    expect(response.parsed_body.dig("error", "code")).to eq("upstream_error")
  end

  it "preserves the upstream timeout contract" do
    stub_request(:get, Microcms::FetchArticlesService::ENDPOINT).with(query: { limit: "100", offset: "0", orders: "-publishedAt" }).to_raise(Faraday::TimeoutError)
    get "/api/app/bookshelf"
    expect(response).to have_http_status(:gateway_timeout)
    expect(response.parsed_body.dig("error", "code")).to eq("upstream_timeout")
  end

  it "returns rate limiting through the common no-store error contract" do
    allow(Bookshelf::Cover).to receive(:call).with("9784101010014").and_raise(Bookshelf::Cover::RateLimited)
    get "/api/app/bookshelf/9784101010014/cover"
    expect(response).to have_http_status(:service_unavailable)
    expect(response.parsed_body.dig("error", "code")).to eq("upstream_rate_limited")
    expect(response.headers["Cache-Control"]).to include("no-store")
  end

  it "returns no cover for an invalid ID" do
    get "/api/app/bookshelf/B012345678/cover"
    expect(response.parsed_body).to eq("cover" => nil)
    expect(response.headers["Cache-Control"]).to include("no-store")
  end
end
