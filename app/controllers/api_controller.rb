class ApiController < ApplicationController
  before_action :skip_session_for_api
  after_action :set_no_store_cache_headers

  rescue_from Microcms::FetchContentsService::FetchError, with: :render_microcms_fetch_error
  rescue_from Faraday::Error, with: :render_faraday_error

  private

  def render_json_result(result)
    render json: result.fetch(:json), status: result.fetch(:status)
  end

  def render_body_result(result)
    render plain: result.fetch(:body), content_type: result.fetch(:content_type), status: result.fetch(:status)
  end

  def skip_session_for_api
    request.session_options[:skip] = true
  end

  def protect_against_forgery?
    false
  end

  def set_no_store_cache_headers
    response.cache_control.clear
    response.cache_control[:no_store] = true
  end

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

  def render_invalid_request(error)
    render_error_response(status: :bad_request, code: "invalid_request", message: error.message)
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
    render_error_response(
      status:,
      code:,
      message: ApplicationController::ERROR_MESSAGE_BY_CODE.fetch(code)
    )
  end

  def render_error_response(status:, code:, message:)
    clear_error_cache_headers!

    render json: {
      error: {
        code: code,
        message: message,
        request_id: request.request_id
      }
    }, status: status
  end

  def clear_error_cache_headers!
    set_no_store_cache_headers
    response.headers.delete("ETag")
  end
end
