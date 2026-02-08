class ArticlesController < ApplicationController
  def index
    result = ArticlesIndexUsecase.call
    render json: result[:articles]
  end
end
