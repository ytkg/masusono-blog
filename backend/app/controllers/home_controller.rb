class HomeController < WebController
  def show
    render inertia: "Home"
  end
end
