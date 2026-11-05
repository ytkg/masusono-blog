module RequiredUserId
  private

  def validate_user_id!(user_id)
    raise ArgumentError, "user_id must be a string" unless user_id.nil? || user_id.is_a?(String)

    return unless user_id.to_s.strip.empty?

    raise ArgumentError, "user_id is required"
  end
end
