# frozen_string_literal: true

require "digest/sha1"

module ViteRubyWatchedFiles
  FRONTEND_TEST_FILE = %r{(^|/).+\.(test|spec)\.(js|jsx)$}

  def watched_files_digest
    cached = @watched_files_digest_cache
    return cached.last if cached && Time.now - cached.first < 1

    root = config.root
    file_ids = Dir.glob(config.watched_paths, base: root).sort.filter_map do |path|
      next if path.match?(FRONTEND_TEST_FILE)

      absolute_path = File.expand_path(path, root)
      next if File.directory?(absolute_path)

      "#{File.basename(path)}/#{Digest::SHA1.file(absolute_path).hexdigest}"
    rescue Errno::ENOENT, Errno::ENOTDIR
      nil
    end

    digest = Digest::SHA1.hexdigest(file_ids.join("/"))
    # Publish the timestamp and value together; another thread must never see a
    # fresh timestamp paired with an unfinished digest.
    @watched_files_digest_cache = [ Time.now, digest ].freeze
    digest
  end
end

ViteRuby::Builder.prepend(ViteRubyWatchedFiles)
