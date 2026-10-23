module Bookshelf
  class Candidates
    def self.call(articles)
      books = {}
      articles.each do |article|
        next if article[:publishedAt].blank? || article[:id].blank?
        published_at = begin
          CalendarDateValidator.validate!(article[:publishedAt])
          Time.iso8601(article[:publishedAt])
        rescue ArgumentError, TypeError
          nil
        end
        next unless published_at

        Nokogiri::HTML.fragment(article[:content].to_s).css("a[href]").each_with_index do |link, position|
          asin = product_id(link["href"])
          isbn = Isbn.from_asin(asin)
          next unless isbn

          book = books[isbn] ||= { isbn: isbn, amazonUrl: "https://www.amazon.co.jp/dp/#{asin}", appearances: {} }
          book[:appearances][article[:id]] ||= {
            id: article[:id], title: article[:title].to_s, publishedAt: published_at.iso8601,
            time: published_at, position: position
          }
        end
      end
      books.values.each do |book|
        book[:first] = book[:appearances].values.min_by { |entry| [ entry[:time], entry[:id] ] }
      end.sort_by { |book| [ -book[:first][:time].to_f, book[:first][:id], book[:first][:position] ] }
    end

    def self.product_id(href)
      uri = URI.parse(href)
      return unless %w[https http].include?(uri.scheme) && %w[amazon.co.jp www.amazon.co.jp].include?(uri.host&.downcase) && uri.userinfo.nil?

      uri.path.match(%r{/(?:dp|gp/product)/([A-Z0-9]{10})(?:/|$)})&.captures&.first
    rescue URI::InvalidURIError
      nil
    end
    private_class_method :product_id
  end
end
