module Bookshelf
  class Catalog
    ENDPOINT = "https://api.openbd.jp/v1/get".freeze
    BATCH_SIZE = 100
    BUDGET_SECONDS = 20

    def self.call
      new.call
    end

    def call
      candidates = Candidates.call(Article.all)
      deadline = Process.clock_gettime(Process::CLOCK_MONOTONIC) + BUDGET_SECONDS
      summaries = {}
      failed = false
      connection = Microcms::ConnectionFactory.build
      candidates.each_slice(BATCH_SIZE) do |batch|
        remaining = deadline - Process.clock_gettime(Process::CLOCK_MONOTONIC)
        if remaining <= 0
          failed = true
          break
        end
        begin
          response = connection.get(ENDPOINT, isbn: batch.pluck(:isbn).join(",")) do |request|
            request.options.timeout = [ remaining, 5 ].min
            request.options.open_timeout = [ remaining, 3 ].min
          end
          raise Faraday::Error, "Book metadata unavailable" unless response.success?
          data = JSON.parse(response.body)
          raise Faraday::Error, "Invalid book metadata" unless data.is_a?(Array) && data.size == batch.size && data.all? { |entry| entry.nil? || entry.is_a?(Hash) }
          data.compact.each do |entry|
            summary = entry["summary"]
            next unless summary.is_a?(Hash) && batch.any? { |book| book[:isbn] == summary["isbn"] }
            next unless summary["title"].is_a?(String) && summary["title"].present? && summary["author"].is_a?(String) && summary["author"].present?
            summaries[summary["isbn"]] = summary
          end
        rescue Faraday::Error, JSON::ParserError
          failed = true
          # Do not retry or keep sending batches after a service failure/429.
          break
        end
      end
      books = candidates.filter_map do |book|
        summary = summaries[book[:isbn]]
        next unless summary
        {
          isbn: book[:isbn], title: summary["title"], author: summary["author"], amazonUrl: book[:amazonUrl],
          articles: book[:appearances].values.sort_by { |entry| [ -entry[:time].to_f, entry[:id] ] }.map { |entry| entry.slice(:id, :title, :publishedAt) }
        }
      end
      raise Faraday::Error, "Book metadata unavailable" if failed && books.empty?
      { books: books, partial: failed }
    end
  end
end
