class FeedsController < ApiController
  def show
    result = FeedsShowUsecase.call
    render_body_result(result)
  end
end
