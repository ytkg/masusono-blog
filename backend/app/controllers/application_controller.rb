class ApplicationController < ActionController::Base
  UPSTREAM_CLIENT_ERROR_STATUS = 424

  ERROR_MESSAGE_BY_CODE = {
    "upstream_client_error" => "Upstream service rejected the request.",
    "upstream_rate_limited" => "Upstream service is temporarily rate limited.",
    "upstream_server_error" => "Upstream service returned an unexpected error.",
    "upstream_timeout" => "Upstream service request timed out.",
    "upstream_connection_error" => "Failed to connect to upstream service.",
    "upstream_error" => "Upstream service request failed."
  }.freeze

  protect_from_forgery with: :exception
  layout "application"

  inertia_share app: -> { inertia_shared_app },
                flash: -> { inertia_shared_flash }

  private

  def inertia_render(result)
    render inertia: result.except(:status), status: result[:status]
  end

  def inertia_shared_app
    { name: "増田とその他！" }
  end

  def inertia_shared_flash
    {
      notice: flash[:notice],
      alert: flash[:alert]
    }
  end
end
