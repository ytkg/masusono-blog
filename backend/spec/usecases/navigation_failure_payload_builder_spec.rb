require "rails_helper"

RSpec.describe NavigationFailurePayloadBuilder do
  subject(:result) { described_class.call(params) }

  let(:params) do
    {
      "kind" => "network_error", "path" => "/authors?token=private#secret", "source_path" => "/search?q=private",
      "status" => 0, "response_request_id" => "bad\nlog=forged", "content_type" => "text/html; token=private",
      "elapsed_ms" => "invalid", "online" => false, "prefetch" => true, "service_worker" => "true"
    }
  end

  it "検索語・ログ偽装文字・不正な型を除外する" do
    expect(result).to eq(kind: "network_error", path: "/authors", source_path: "/search", online: false, prefetch: true)
  end

  context "外部URLや非公開のパスの場合" do
    let(:params) { super().merge("path" => "https://evil.example/authors", "source_path" => "/api/app/users/private") }

    it "記録しない" do
      expect(result).not_to have_key(:path)
      expect(result).not_to have_key(:source_path)
    end
  end
end

RSpec.describe NavigationFailurePayloadBuilder do
  [ "/", "/about", "/others", "/search", "/authors", "/authors/a-1", "/numbers", "/articles/a_1", "/blog", "/blog/a-1" ].each do |path|
    it "keeps public path #{path} without its query or fragment" do
      expect(described_class.call("kind" => "http_exception", "path" => "#{path}?secret=value#private")[:path]).to eq(path)
    end
  end

  it "keeps integer boundaries and boolean false, dropping values outside the bounds" do
    params = { "kind" => "network_error", "status" => 100, "elapsed_ms" => 0, "prefetch_in_flight" => false }
    expect(described_class.call(params)).to include(status: 100, elapsed_ms: 0, prefetch_in_flight: false)
    expect(described_class.call(params.merge("status" => 599, "elapsed_ms" => 86_400_000))).to include(status: 599, elapsed_ms: 86_400_000)
    expect(described_class.call(params.merge("status" => 600, "elapsed_ms" => -1, "prefetch_in_flight" => "false"))).to eq(kind: "network_error")
  end

  it "rejects unknown kinds and protocol-relative URLs" do
    expect { described_class.call("kind" => "unknown") }.to raise_error(ArgumentError)
    expect(described_class.call("kind" => "network_error", "path" => "//example.com/articles/a")).to eq(kind: "network_error")
  end
end
