module Bookshelf
  class Cover
    class RateLimited < StandardError; end

    ENDPOINT = "https://www.googleapis.com/books/v1/volumes".freeze

    def self.call(isbn)
      return nil unless isbn.match?(/\A978[0-9]{10}\z/)
      key = Rails.application.credentials.dig(:google_books, :api_key)
      contact = Rails.application.credentials.dig(:google_books, :removal_contact_url)
      # Enable only once operations has configured a restricted key and a public rights-holder contact.
      return nil if key.blank? || safe_url(contact, %w[https]).nil?

      response = Microcms::ConnectionFactory.build.get(ENDPOINT, q: "isbn:#{isbn}", key: key, maxResults: 10) do |request|
        request.options.timeout = 5
        request.options.open_timeout = 3
      end
      raise RateLimited, "Cover service rate limited" if response.status == 429
      return nil unless response.success?
      data = JSON.parse(response.body)
      return nil unless data.is_a?(Hash) && data["items"].is_a?(Array)
      data["items"].each do |item|
        next unless item.is_a?(Hash) && item["volumeInfo"].is_a?(Hash)
        info = item["volumeInfo"]
        identifiers = info["industryIdentifiers"]
        next unless identifiers.is_a?(Array) && identifiers.any? { |id| id.is_a?(Hash) && ((id["type"] == "ISBN_13" && id["identifier"] == isbn) || (id["type"] == "ISBN_10" && Isbn.from_asin(id["identifier"]) == isbn)) }
        next unless item.dig("saleInfo", "isEbook") == false
        image = safe_url(info.dig("imageLinks", "thumbnail"), %w[https http], %w[books.google.com books.google.co.jp books.googleusercontent.com])
        page = safe_url(info["infoLink"], %w[https http], %w[books.google.com books.google.co.jp])
        next unless image && page
        return { imageUrl: image, googleBooksUrl: page, removalContactUrl: contact }
      end
      nil
    rescue Faraday::Error, JSON::ParserError, TypeError
      nil
    end

    def self.safe_url(value, schemes, hosts = nil)
      return unless value.is_a?(String)
      uri = URI.parse(value)
      return unless schemes.include?(uri.scheme) && uri.host.present? && uri.userinfo.nil? && (!hosts || hosts.include?(uri.host))
      uri.scheme = "https"
      uri.to_s
    rescue URI::InvalidURIError
      nil
    end
    private_class_method :safe_url
  end
end
