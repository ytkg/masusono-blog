module RequiredUserId
  private

  def validate_user_id!(user_id)
    return unless user_id.to_s.strip.empty?

    raise ArgumentError, "user_id is required"
  end
end
