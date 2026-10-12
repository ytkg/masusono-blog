require "json"
require "openssl"

module Webhooks
  module Microcms
    class ArticlesController < ApplicationController
      skip_forgery_protection

      def create
        raw_payload = request.raw_post
        return head :unauthorized unless valid_signature?(raw_payload)

        result = ArticlesCreateUsecase.call(raw_payload:)
        head(result.fetch(:article_missing) ? :not_found : :no_content)
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
    end
  end
end
