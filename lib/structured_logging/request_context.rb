module StructuredLogging
  class RequestContext
    def initialize(app)
      @app = app
    end

    def call(env)
      request = ActionDispatch::Request.new(env)

      CurrentRequest.set(request_id: request.request_id, path: request.path) do
        @app.call(env)
      end
    end
  end
end
