class BlogController < WebController
  def index
    result = ArticlesIndexUsecase.call
    render inertia: "Blog", props: { articles: result[:articles] }
  end

  def show
    article = ArticlesShowUsecase.call(article_id: params[:article_id])

    if article
      render inertia: "BlogDetail", props: { article: article }
    else
      render inertia: "BlogDetail", props: { article: nil }, status: :not_found
    end
  end
end
