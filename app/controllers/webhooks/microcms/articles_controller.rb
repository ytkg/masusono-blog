require "json"
require "openssl"

module Webhooks
  module Microcms
    class ArticlesController < ApplicationController
      skip_forgery_protection

      def create
        raw_payload = request.raw_post
        return head :unauthorized unless valid_signature?(raw_payload)

        payload = JSON.parse(raw_payload)
        return head :no_content unless new_article?(payload)

        article = Article.find(payload.fetch("id"))
        return head :not_found unless article

        WebPush::ArticlePublishedNotifier.call(article:)
        head :no_content
      rescue JSON::ParserError, KeyError
        head :bad_request
      end

      private

      def valid_signature?(raw_payload)
        signature = request.headers["X-Microcms-Signature"].to_s
        expected = OpenSSL::HMAC.hexdigest("SHA256", webhook_secret, raw_payload)

        signature.bytesize == expected.bytesize && ActiveSupport::SecurityUtils.secure_compare(signature, expected)
      end

      def webhook_secret
        secret = Rails.application.credentials.dig(:web_push, :microcms_webhook_secret).to_s
        raise "web_push.microcms_webhook_secret is missing" if secret.empty?

        secret
      end

      def new_article?(payload)
        payload["api"] == "articles" && payload["type"] == "new" && payload["id"].present?
      end
    end
  end
end
