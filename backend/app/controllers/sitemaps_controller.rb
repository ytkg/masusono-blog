class SitemapsController < ApiController
  def index
    result = SitemapsIndexUsecase.call
    render_body_result(result)
  end
end
