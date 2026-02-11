class HomeController < WebController
  def show
    render inertia: true
  end
end
