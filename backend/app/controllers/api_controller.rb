class ApiController < ApplicationController
  rescue_from Microcms::FetchContentsService::FetchError, with: :render_microcms_fetch_error
  rescue_from Faraday::Error, with: :render_faraday_error

  private

  def render_microcms_fetch_error(error)
    status, code = map_microcms_status(error.status)
    render_api_error(status:, code:)
  end

  def render_faraday_error(error)
    case error
    when Faraday::TimeoutError
      render_api_error(status: :gateway_timeout, code: "upstream_timeout")
    when Faraday::ConnectionFailed
      render_api_error(status: :bad_gateway, code: "upstream_connection_error")
    else
      render_api_error(status: :bad_gateway, code: "upstream_error")
    end
  end

  def map_microcms_status(status)
    parsed_status = Integer(status, exception: false)

    case parsed_status
    when 408
      [ :gateway_timeout, "upstream_timeout" ]
    when 429
      [ :service_unavailable, "upstream_rate_limited" ]
    when 400..499
      [ ApplicationController::UPSTREAM_CLIENT_ERROR_STATUS, "upstream_client_error" ]
    when 500..599
      [ :bad_gateway, "upstream_server_error" ]
    else
      [ :bad_gateway, "upstream_error" ]
    end
  end

  def render_api_error(status:, code:)
    response.cache_control.clear
    response.cache_control[:no_store] = true
    response.headers.delete("ETag")

    render json: {
      error: {
        code: code,
        message: ApplicationController::ERROR_MESSAGE_BY_CODE.fetch(code)
      }
    }, status: status
  end
end
