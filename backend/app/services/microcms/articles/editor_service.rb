require "faraday"
require "json"
require "digest"

module Microcms
  module Articles
    class EditorService
      CONTENT_ENDPOINT = "https://masusono.microcms.io/api/v1/articles".freeze
      MANAGEMENT_ENDPOINT = "https://masusono.microcms-management.io/api/v1/contents/articles".freeze
      SCHEMA_ENDPOINT = "https://masusono.microcms-management.io/api/v1/apis/articles".freeze
      EDITABLE_STATUSES = %w[PUBLISH DRAFT].freeze
      FIELDS = %w[title content author publishedAt].freeze

      class Error < StandardError
        attr_reader :code, :status

        def initialize(code, message, status = :bad_gateway)
          @code = code
          @status = status
          super(message)
        end
      end

      def initialize(connection: nil, api_key: nil)
        @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
        raise Error.new("articles_unavailable", "記事に接続できません。") if @api_key.blank?

        @connection = connection || Faraday.new do |client|
          client.options.open_timeout = 5
          client.options.timeout = 10
        end
      end

      def fetch(id)
        validate_id!(id)
        metadata = request(:get, "#{MANAGEMENT_ENDPOINT}/#{id}")
        raise Error.new("articles_unavailable", "記事の応答を確認できません。") unless metadata["id"] == id
        revision(metadata)
        status = metadata.fetch("status").first
        unless EDITABLE_STATUSES.include?(status)
          return { id:, status:, editable: false, revision: revision(metadata), content_editable: false }
        end

        query = status == "DRAFT" ? { draftKey: metadata.fetch("draftKey") } : {}
        article = request(:get, "#{CONTENT_ENDPOINT}/#{id}", query:)
        {
          id:, title: article["title"].to_s, content: article["content"].to_s,
          author_id: article.dig("author", "id"), published_at: article["publishedAt"],
          status:, editable: true, revision: revision(metadata), content_editable: rich_editor?
        }
      rescue KeyError, TypeError
        raise Error.new("articles_unavailable", "記事の応答を確認できません。")
      end

      def update(id, attributes:, expected_revision:)
        validate_attributes!(attributes)
        current = fetch(id)
        unless current[:editable]
          raise Error.new("article_not_editable", "この記事は microCMS で確認してください。", :conflict)
        end
        if expected_revision.blank? || current[:revision] != expected_revision
          raise Error.new("article_conflict", "記事が別の場所で更新されています。入力内容を控えてから再読み込みしてください。", :conflict)
        end

        changes = changes_for(current, attributes)
        if changes.key?("content") && !current[:content_editable]
          raise Error.new("unsupported_editor", "本文の保存形式を確認できません。microCMS で編集してください。", :unprocessable_content)
        end
        validate_content!(changes["content"]) if changes.key?("content")
        return current if changes.empty?

        latest = request(:get, "#{MANAGEMENT_ENDPOINT}/#{id}")
        if revision(latest) != expected_revision
          raise Error.new("article_conflict", "記事が別の場所で更新されています。入力内容を控えてから再読み込みしてください。", :conflict)
        end
        request(:patch, "#{CONTENT_ENDPOINT}/#{id}", body: changes)
        # A failed read after PATCH must not invite a blind retry of an already applied save.
        begin
          saved = fetch(id)
          if !saved[:editable] || changes_for(saved, changes).any?
            current.merge(save_uncertain: true, revision: nil)
          else
            saved
          end
        rescue Error, ArgumentError, TypeError
          current.merge(save_uncertain: true, revision: nil)
        end
      end

      private

      def validate_id!(id)
        raise Error.new("invalid_request", "記事IDが正しくありません。", :bad_request) unless id.match?(/\A[a-zA-Z0-9_-]{1,128}\z/)
      end

      def revision(metadata)
        unless metadata["updatedAt"].is_a?(String) && metadata["updatedAt"].present? &&
            metadata["status"].is_a?(Array) && metadata["status"].size == 1 &&
            %w[PUBLISH DRAFT PUBLISH_AND_DRAFT CLOSED].include?(metadata["status"].first)
          raise Error.new("articles_unavailable", "記事の更新日時・状態を確認できません。")
        end
        Digest::SHA256.hexdigest(JSON.generate(metadata.slice("id", "updatedAt", "status")))
      end

      def rich_editor?
        schema = request(:get, SCHEMA_ENDPOINT)
        schema.fetch("apiFields", []).any? { |field| field["fieldId"] == "content" && field["kind"] == "richEditorV2" }
      rescue Error
        false
      end

      def validate_attributes!(attributes)
        unless attributes.is_a?(Hash) && (attributes.keys - FIELDS).empty? && attributes.values.all? { |value| value.is_a?(String) || value.nil? }
          raise Error.new("invalid_request", "編集内容が正しくありません。", :unprocessable_content)
        end
        if attributes.key?("title") && attributes["title"].to_s.strip.empty?
          raise Error.new("invalid_request", "タイトルを入力してください。", :unprocessable_content)
        end
        if attributes["author"].present? && !attributes["author"].match?(/\A[a-zA-Z0-9_-]{1,128}\z/)
          raise Error.new("invalid_request", "著者が正しくありません。", :unprocessable_content)
        end
        return unless attributes.key?("publishedAt")

        date = Time.iso8601(attributes["publishedAt"].to_s)
        raise ArgumentError if date > Time.current
      rescue ArgumentError
        raise Error.new("invalid_request", "公開日時には現在以前の日時を入力してください。", :unprocessable_content)
      end

      def changes_for(current, attributes)
        original = { "title" => current[:title], "content" => current[:content], "author" => current[:author_id], "publishedAt" => current[:published_at] }
        attributes.reject do |key, value|
          if key == "content"
            Nokogiri::HTML5.fragment(value.to_s).to_html == Nokogiri::HTML5.fragment(original[key].to_s).to_html
          elsif key == "publishedAt" && original[key].present?
            Time.iso8601(value) == Time.iso8601(original[key])
          else
            value == original[key]
          end
        end
      end

      def validate_content!(html)
        fragment = Nokogiri::HTML5.fragment(html.to_s)
        allowed = %w[p h1 h2 h3 h4 h5 strong em u s a ul ol li blockquote pre code br img hr]
        attrs = %w[id href target rel src alt width height class start]
        invalid = fragment.css("*").any? do |node|
          !allowed.include?(node.name) || node.attribute_nodes.any? { |attr| !attrs.include?(attr.name) } ||
            %w[href src].any? { |name| node[name].present? && !node[name].match?(%r{\A(?:https?://|/[^/]|#|mailto:)}i) }
        end
        raise Error.new("unsupported_content", "保存できない装飾が含まれています。microCMS で編集してください。", :unprocessable_content) if invalid
      end

      def request(method, url, query: {}, body: nil)
        response = @connection.public_send(method, url, query.presence) do |req|
          req.headers["X-MICROCMS-API-KEY"] = @api_key
          req.headers["Accept"] = "application/json"
          if body
            req.headers["Content-Type"] = "application/json"
            req.body = JSON.generate(body)
          end
        end
        unless response.success?
          code = method == :patch && response.status >= 500 ? "save_uncertain" : "articles_unavailable"
          raise Error.new(code, "記事の取得・保存に失敗しました。microCMS の状態を確認してください。")
        end

        payload = JSON.parse(response.body)
        unless payload.is_a?(Hash)
          raise Error.new(method == :patch ? "save_uncertain" : "articles_unavailable", "記事の応答を確認できません。")
        end

        payload
      rescue Faraday::Error, JSON::ParserError
        message = method == :patch ? "保存結果を確認できません。再保存する前に microCMS の内容を確認してください。" : "記事を取得できません。時間をおいて再度お試しください。"
        raise Error.new(method == :patch ? "save_uncertain" : "articles_unavailable", message)
      end
    end
  end
end
