class ShopIndexUsecase
  def self.call
    new.call
  end

  def call
    {
      shops: Api::Shop::ShopsIndexUsecase.call.fetch(:shops)
    }
  end
end
