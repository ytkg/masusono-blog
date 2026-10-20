module Dashboard
  class HomeController < ApplicationController
    def index
      render_inertia_result(DashboardHomeUsecase.call, component: "dashboard/home")
    end
  end
end
