class ArticleContentImageUrlOptimizer
  DEFAULT_IMAGE_SIZE = 800
  RESPONSIVE_IMAGE_WIDTHS = [ 400, 800 ].freeze
  RESPONSIVE_IMAGE_SIZES = "(max-width: 800px) 100vw, 800px".freeze

  def self.call(content)
    new(content).call
  end

  def initialize(content)
    @content = content
  end

  def call
    return content unless content.is_a?(String)
    return content if content.blank?

    fragment = Nokogiri::HTML5.fragment(content)

    fragment.css("img[src]").each do |image|
      attributes = optimized_attributes(image["src"])
      next unless attributes

      attributes.each do |attribute, value|
        image[attribute] = value
      end
    end

    fragment.to_html
  end

  private

  attr_reader :content

  def optimized_attributes(url)
    image_url = MicrocmsImageUrl.parse(url)
    return unless image_url

    {
      "src" => image_url.resize(fit: "max", size: DEFAULT_IMAGE_SIZE),
      "srcset" => responsive_srcset(image_url),
      "sizes" => RESPONSIVE_IMAGE_SIZES,
      "decoding" => "async"
    }
  end

  def responsive_srcset(image_url)
    RESPONSIVE_IMAGE_WIDTHS.map do |width|
      "#{image_url.resize(fit: "max", size: width)} #{width}w"
    end.join(", ")
  end
end
