require "rails_helper"

RSpec.describe StructuredLogging::RequestContext do
  let(:env) { Rack::MockRequest.env_for("/search?q=private").merge("action_dispatch.request_id" => "request-123") }

  it "下流のアプリへrequest IDとパスを渡し、終了後に以前の文脈を戻す" do
    app = ->(received_env) do
      expect(received_env).to equal(env)
      expect(CurrentRequest.request_id).to eq("request-123")
      expect(CurrentRequest.path).to eq("/search")
      [ 200, {}, [ "ok" ] ]
    end

    CurrentRequest.set(request_id: "outer", path: "/outer") do
      expect(described_class.new(app).call(env)).to eq([ 200, {}, [ "ok" ] ])
      expect(CurrentRequest.request_id).to eq("outer")
      expect(CurrentRequest.path).to eq("/outer")
    end
  end

  it "下流で例外が発生してもリクエスト文脈を残さない" do
    app = ->(_) { raise "downstream failed" }

    expect { described_class.new(app).call(env) }.to raise_error("downstream failed")
    expect(CurrentRequest.request_id).to be_nil
    expect(CurrentRequest.path).to be_nil
  end
end
