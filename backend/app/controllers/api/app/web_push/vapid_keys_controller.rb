module Api
  module App
    module WebPush
      class VapidKeysController < ApiController
        def show
          render_json_result(VapidPublicKeyUsecase.call)
        end
      end
    end
  end
end
