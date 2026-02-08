class SitemapsController < ApplicationController
  def index
    result = SitemapsIndexUsecase.call
    render plain: result.xml, content_type: result.content_type
  end
end
