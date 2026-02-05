module MicrocmsResponseHandling
  private

  def microcms_client
    @microcms_client ||= Microcms::ArticlesClient.new
  end

  def render_microcms_error(response)
    content_type = response.headers["content-type"] || "application/json"
    render body: response.body, status: response.status, content_type: content_type
  end

  def log_microcms_error(prefix, error)
    Rails.logger.error("#{prefix}: #{error.class}: #{error.message}")
  end
end
