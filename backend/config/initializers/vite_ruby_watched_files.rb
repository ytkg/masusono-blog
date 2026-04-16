# frozen_string_literal: true

require "digest/sha1"

module ViteRubyWatchedFiles
  FRONTEND_TEST_FILE = %r{(^|/).+\.(test|spec)\.(js|jsx)$}

  def watched_files_digest
    return @last_digest if @last_digest_at && Time.now - @last_digest_at < 1

    config.within_root do
      files = Dir[*config.watched_paths].reject { |path| File.directory?(path) || path.match?(FRONTEND_TEST_FILE) }
      file_ids = files.sort.filter_map do |path|
        "#{File.basename(path)}/#{Digest::SHA1.file(path).hexdigest}"
      rescue Errno::ENOENT, Errno::ENOTDIR
        nil
      end

      @last_digest_at = Time.now
      @last_digest = Digest::SHA1.hexdigest(file_ids.join("/"))
    end
  end
end

ViteRuby::Builder.prepend(ViteRubyWatchedFiles)
