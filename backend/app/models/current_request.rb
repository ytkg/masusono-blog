class CurrentRequest < ActiveSupport::CurrentAttributes
  attribute :request_id, :path
end
