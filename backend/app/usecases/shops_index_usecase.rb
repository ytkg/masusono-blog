class ShopsIndexUsecase
  Result = Struct.new(:shops, keyword_init: true)

  def self.call
    new.call
  end

  def call
    Result.new(shops: Shop.all)
  end
end
