class AuthorImageUrlOptimizer
  AVATAR_SIZE = 192

  def self.call(url)
    MicrocmsImageUrl.parse(url)&.resize(fit: "crop", size: AVATAR_SIZE) || url
  end
end
