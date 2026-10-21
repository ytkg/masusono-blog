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

  context "PWA診断項目が改変されている場合" do
    let(:params) do
      super().merge(
        "kind" => "module_load_error", "stage" => "private", "build_version" => "202610211600secret",
        "controller_state" => "private", "visibility" => "private", "data_source" => "private",
        "tap_ms" => -1, "frame_ms" => 86_400_001, "module_start_ms" => "12", "commit_ms" => 86_400_000,
        "standalone" => "true", "backgrounded" => true, "recovered" => false
      )
    end

    it "列挙値・整数範囲・Booleanを検証する" do
      expect(result).to eq(
        kind: "module_load_error", path: "/authors", source_path: "/search", online: false, prefetch: true,
        commit_ms: 86_400_000, backgrounded: true, recovered: false
      )
    end
  end

  context "外部URLや非公開のパスの場合" do
    let(:params) { super().merge("path" => "https://evil.example/authors", "source_path" => "/api/app/users/private") }

    it "記録しない" do
      expect(result).not_to have_key(:path)
      expect(result).not_to have_key(:source_path)
    end
  end
end
