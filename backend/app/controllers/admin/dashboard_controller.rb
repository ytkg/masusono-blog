module Admin
  class DashboardController < BaseController
    def index
      render inertia: "admin/dashboard"
    end
  end
end
