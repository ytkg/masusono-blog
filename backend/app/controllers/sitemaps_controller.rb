class SitemapsController < ApplicationController
  def index
    result = SitemapsIndexUsecase.call
    render plain: result[:plain], content_type: result[:content_type], status: result[:status]
  end
end
