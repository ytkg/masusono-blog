require "rails_helper"
require "openssl"

RSpec.describe "Webhooks::Microcms::Articles", type: :request do
  let(:secret) { "webhook-secret" }
  let(:payload) { { api: "articles", id: "article-1", type: "new" }.to_json }

  before do
    allow(Rails.application.credentials).to receive(:dig).with(:web_push, :microcms_webhook_secret).and_return(secret)
    allow(Article).to receive(:find).with("article-1").and_return({ id: "article-1", title: "新しい記事" })
    allow(WebPush::ArticlePublishedNotifier).to receive(:call)
  end

  it "署名付きの新規記事Webhookで通知を送る" do
    post "/webhooks/microcms/articles", params: payload, headers: { "CONTENT_TYPE" => "application/json", "X-Microcms-Signature" => signature(payload) }

    expect(response).to have_http_status(:no_content)
    expect(WebPush::ArticlePublishedNotifier).to have_received(:call).with(article: { id: "article-1", title: "新しい記事" })
  end

  it "署名が不正なWebhookを拒否する" do
    post "/webhooks/microcms/articles", params: payload, headers: { "CONTENT_TYPE" => "application/json", "X-Microcms-Signature" => "invalid" }

    expect(response).to have_http_status(:unauthorized)
    expect(WebPush::ArticlePublishedNotifier).not_to have_received(:call)
  end

  it "更新イベントは通知しない" do
    body = { api: "articles", id: "article-1", type: "edit" }.to_json
    post "/webhooks/microcms/articles", params: body, headers: { "CONTENT_TYPE" => "application/json", "X-Microcms-Signature" => signature(body) }

    expect(response).to have_http_status(:no_content)
    expect(WebPush::ArticlePublishedNotifier).not_to have_received(:call)
  end

  def signature(body)
    OpenSSL::HMAC.hexdigest("SHA256", secret, body)
  end
end
