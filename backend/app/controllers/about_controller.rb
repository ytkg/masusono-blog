class AboutController < WebController
  def show
    render inertia: "About"
  end
end
