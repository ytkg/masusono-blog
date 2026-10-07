require "cgi"
require "digest"
require "fileutils"
require "open3"
require "tmpdir"

class ArticleOgpImage
  # Bump when layout, logo or rendering dependencies change.
  TEMPLATE_VERSION = "3"
  WIDTH = 1200
  HEIGHT = 630
  TITLE_WIDTH = 1072
  TITLE_HEIGHT = 310
  LOGO = Rails.root.join("app/frontend/assets/logo.webp").freeze

  class GenerationError < StandardError; end

  def self.version(article:)
    Digest::SHA256.hexdigest([ TEMPLATE_VERSION, article.fetch(:id), article.fetch(:title) ].to_json).first(24)
  end

  def self.path(article:)
    Rails.application.routes.url_helpers.article_image_path(article_id: article.fetch(:id), version: version(article:))
  end

  def self.call(article:)
    Rails.cache.fetch("article-ogp/#{version(article:)}", expires_in: 7.days) do
      new.render(title: article.fetch(:title))
    end
  rescue GenerationError
    # Do not cache fallback under an article version; a later request can retry.
    Rails.logger.warn("Article OGP generation failed; serving common image")
    File.binread(Rails.root.join("public/ogp-fallback.png"))
  end

  def render(title:)
    Dir.mktmpdir("article-ogp") do |directory|
      text_path = File.join(directory, "title.png")
      render_title(title, text_path)
      output = File.join(directory, "image.png")
      command("convert", "-size", "#{WIDTH}x#{HEIGHT}", "xc:#F6F2FA",
        "(", LOGO.to_s, "-resize", "360x180>", ")", "-geometry", "+420+64", "-composite",
        text_path, "-geometry", "+64+256", "-composite",
        "-fill", "none", "-stroke", "#3E1D6E", "-strokewidth", "8",
        "-draw", "rectangle 4,4 1195,625", "-strip", "PNG32:#{output}")
      File.binread(output)
    end
  rescue IOError, SystemCallError => error
    raise GenerationError, error.class.name
  end

  private

  def render_title(title, path)
    text = title.to_s.gsub(/[[:cntrl:]]/, " ")
    [ 64, 60, 56, 52, 48 ].each do |size|
      draw_text(text, size, path)
      if fits?(path, size)
        prefer_punctuation_breaks(text, size, path)
        return
      end
    end

    # Grapheme boundaries preserve combining characters and emoji sequences.
    graphemes = text.scan(/\X/)
    low = 0
    high = graphemes.length
    while low < high
      middle = (low + high + 1) / 2
      draw_text(graphemes.first(middle).join + "…", 48, path)
      fits?(path, 48) ? low = middle : high = middle - 1
    end
    draw_text(graphemes.first(low).join + "…", 48, path)
  end

  def prefer_punctuation_breaks(text, size, path)
    return if image_height(path) <= (size * 1.5).ceil

    # Keep punctuation clusters and closing quotes with the preceding phrase.
    candidate = text.gsub(/([、。！？!?]+[」』）)]*)(?=[^、。！？!?」』）)])/) do |punctuation|
      following_text = Regexp.last_match.post_match
      if punctuation.match?(/[！？!?]/) && following_text.match?(/\A[のにはがをともへでや]/)
        punctuation
      else
        "#{punctuation}\n"
      end
    end
    return unless candidate.count("\n").between?(1, 3)

    preferred_path = File.join(File.dirname(path), "preferred-title.png")
    draw_text(candidate, size, preferred_path)
    FileUtils.cp(preferred_path, path) if fits?(preferred_path, size)
  end

  def fits?(path, size)
    image_height(path) <= [ TITLE_HEIGHT, (size * 1.5 * 4).ceil ].min
  end

  def image_height(path)
    command("identify", "-format", "%h", path).to_i
  end

  def draw_text(text, size, path)
    # ImageMagick decodes entities/properties before Pango parses markup.
    escaped = CGI.escapeHTML(text).gsub("&", "&amp;").gsub("%", "%%").gsub("\\") { "\\\\" }
    # Pango sizes are 1/1024 point; 96 dpi converts 3/4 point to one pixel.
    markup = "<span font_family='Noto Sans CJK JP' weight='bold' size='#{size * 768}' foreground='#3E1D6E'>#{escaped}</span>"
    command("convert", "-background", "none", "-density", "96", "-size", "#{TITLE_WIDTH}x", "-define", "pango:wrap=word-char", "-define", "pango:align=center", "pango:#{markup}", "PNG32:#{path}")
  end

  def command(*arguments)
    output, _error, status = Open3.capture3("timeout", "15", *arguments)
    raise GenerationError, "Image renderer failed" unless status.success?
    output
  rescue SystemCallError => error
    raise GenerationError, error.class.name
  end
end
