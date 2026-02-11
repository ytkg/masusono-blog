class BlogController < WebController
  def index
    result = BlogIndexUsecase.call
    render inertia: "Blog", props: result[:props], status: result[:status]
  end

  def show
    result = BlogShowUsecase.call(article_id: params[:article_id])
    render inertia: "BlogDetail", props: result[:props], status: result[:status]
  end
end
