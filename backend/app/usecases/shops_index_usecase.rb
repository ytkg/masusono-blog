class ShopsIndexUsecase
  def self.call
    new.call
  end

  def call
    shops = Shop.all.map { |shop| build_shop(shop) }
    { shops: shops }
  end

  private

  def build_shop(shop)
    {
      name: shop[:name],
      category: shop[:category],
      lat: shop[:lat],
      lng: shop[:lng],
      url: shop[:url],
      desc: shop[:desc]
    }
  end
end
