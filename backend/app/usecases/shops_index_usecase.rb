class ShopsIndexUsecase
  def self.call
    new.call
  end

  def call
    { shops: Shop.all }
  end
end
