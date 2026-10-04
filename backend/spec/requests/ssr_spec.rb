require "rails_helper"

RSpec.describe "Public page SSR", type: :request do
  let(:ssr_url) { "http://127.0.0.1:13714/render" }
  let(:html_headers) { { "ACCEPT" => "text/html" } }
  let(:ssr_response) do
    {
      head: [
        '<title data-inertia>SSRタイトル</title>',
        '<meta name="description" content="SSR説明" data-inertia>',
        '<link rel="canonical" href="https://masusono.com/about" data-inertia>'
      ],
      body: '<div id="app" data-server-rendered="true"><article>SSR本文</article></div>'
    }
  end

  around do |example|
    previous_url = InertiaRails.configuration.ssr_url
    previous_bundle = InertiaRails.configuration.ssr_bundle
    InertiaRails.configuration.ssr_bundle = nil
    InertiaRails.configuration.ssr_url = ssr_url
    example.run
  ensure
    InertiaRails.configuration.ssr_url = previous_url
    InertiaRails.configuration.ssr_bundle = previous_bundle
  end

  before do
    # Unit/request specs normally skip SSR; exercise the production selection here.
    allow(Rails.env).to receive(:test?).and_return(false)
    stub_request(:post, ssr_url).to_return(body: ssr_response.to_json, headers: { "Content-Type" => "application/json" })
    allow(BlogIndexUsecase).to receive(:call).and_return(props: { articles: [] }, status: :ok)
    allow(BlogShowUsecase).to receive(:call).and_return(props: { article: { id: "article-1" } }, status: :ok)
    allow(AuthorsIndexUsecase).to receive(:call).and_return(props: { authors: [] }, status: :ok)
    allow(NumbersIndexUsecase).to receive(:call).and_return(props: { metrics: {} }, status: :ok)
    allow(AuthorShowUsecase).to receive(:call).and_return(props: { author: { id: "author-1" }, articles: [] }, status: :ok)
  end

  it "PumaがコントローラなしでSSRの有効化設定を評価できる" do
    expect(InertiaRails.configuration.ssr_enabled).to be(true)
  end

  [ "/", "/about", "/articles/article-1", "/authors", "/authors/author-1" ].each do |path|
    it "#{path}の初回レスポンスにSSRの本文とメタ情報を含める" do
      get path, headers: html_headers

      expect(response).to have_http_status(:ok)
      html = Nokogiri::HTML(response.body)
      expect(html.at_css("#app[data-server-rendered] article").text).to eq("SSR本文")
      expect(html.css("title").map(&:text)).to eq([ "SSRタイトル" ])
      expect(html.at_css('meta[name="description"]')["content"]).to eq("SSR説明")
      expect(html.at_css('link[rel="canonical"]')["href"]).to eq("https://masusono.com/about")
    end
  end

  [ "/search", "/others", "/numbers" ].each do |path|
    it "#{path}をSSRしない" do
      get path, headers: html_headers

      expect(response).to have_http_status(:ok)
      expect(response.body).not_to include("data-server-rendered")
      expect(WebMock).not_to have_requested(:post, ssr_url)
    end
  end

  it "Inertia画面遷移ではSSRせずJSONを返す" do
    get "/about", headers: html_headers.merge("X-Inertia" => "true", "X-Inertia-Version" => "development")

    expect(response.media_type).to eq("application/json")
    expect(response.parsed_body["component"]).to eq("about")
    expect(WebMock).not_to have_requested(:post, ssr_url)
  end

  it "SSR接続失敗時も初期propsを返し、ログへ記録する" do
    stub_request(:post, ssr_url).to_raise(Errno::ECONNREFUSED)
    allow(Rails.logger).to receive(:error)

    get "/about", headers: html_headers

    expect(response).to have_http_status(:ok)
    html = Nokogiri::HTML(response.body)
    expect(html.at_css("#app")).to be_present
    expect(html.at_css('script[data-page="app"]')).to be_present
    expect(response.body).not_to include("data-server-rendered")
    expect(Rails.logger).to have_received(:error).with(/SSR render failed/)
  end

  it "SSR描画失敗時もブラウザ描画へ切り替え、ログへ記録する" do
    stub_request(:post, ssr_url).to_return(status: 500, body: { error: "Rendering failed" }.to_json)
    allow(Rails.logger).to receive(:error)

    get "/about", headers: html_headers

    expect(response).to have_http_status(:ok)
    expect(response.body).to include('data-page="app"')
    expect(response.body).not_to include("data-server-rendered")
    expect(Rails.logger).to have_received(:error).with(/Rendering failed/)
  end

  it "記事が存在しない場合の404を維持する" do
    allow(BlogShowUsecase).to receive(:call).and_return(props: {}, status: :not_found)

    get "/articles/missing", headers: html_headers

    expect(response).to have_http_status(:not_found)
    expect(WebMock).to have_requested(:post, ssr_url).with { |request| JSON.parse(request.body)["component"] == "errors/not_found" }
  end
end
