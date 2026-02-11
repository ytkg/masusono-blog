class AboutController < WebController
  def show
    render inertia: true
  end
end
