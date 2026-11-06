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
  [ "https:/authors", "/authors/%ZZ", "/authors/非公開", "//evil.example/authors", "/authors/" + "a" * 504 ].each do |path|
    context "パスが#{path.inspect}の場合" do
      let(:params) { { "kind" => "network_error", "path" => path } }

      it "不正・外部・過長なパスを記録しない" do
        expect(result).to eq(kind: "network_error")
      end
    end
  end

  [ 100, 599 ].each do |status|
    context "HTTPステータスが境界値#{status}の場合" do
      let(:params) { { "kind" => "http_exception", "status" => status, "elapsed_ms" => 0 } }

      it "境界値を保持する" do
        expect(result).to eq(kind: "http_exception", status: status, elapsed_ms: 0)
      end
    end
  end

  [ 99, 600, "200", 200.0, true ].each do |status|
    context "HTTPステータスが不正な#{status.inspect}の場合" do
      let(:params) { { "kind" => "http_exception", "status" => status } }

      it "型を変換せず除外する" do
        expect(result).to eq(kind: "http_exception")
      end
    end
  end

  context "トークンが許容長の場合" do
    let(:params) do
      { "kind" => "network_error", "response_request_id" => "a" * 100, "content_type" => "application/problem+json" }
    end

    it "リクエストIDとメディアタイプを保持する" do
      expect(result).to eq(kind: "network_error", response_request_id: "a" * 100, content_type: "application/problem+json")
    end
  end

  context "トークンが過長の場合" do
    let(:params) { { "kind" => "network_error", "response_request_id" => "a" * 101 } }

    it "切り詰めず除外する" do
      expect(result).to eq(kind: "network_error")
    end
  end

  {
    "kind" => %w[http_exception network_error navigation_stalled navigation_slow navigation_interrupted module_load_error],
    "stage" => %w[release tap request response data_ready module_start module_end commit frame],
    "controller_state" => %w[none installing installed activating activated redundant],
    "data_source" => %w[cached in_flight network],
    "visibility" => %w[visible hidden]
  }.each do |key, values|
    values.each do |value|
      context "公開列挙値#{key}=#{value}の場合" do
        let(:params) { { "kind" => "network_error", key => value } }

        it { expect(result).to eq({ kind: "network_error" }.merge(key.to_sym => value)) }
      end
    end
  end

  [ nil, "unknown", true, 123, [] ].each do |kind|
    context "kindが#{kind.inspect}の場合" do
      let(:params) { { "kind" => kind } }

      it { expect { result }.to raise_error(ArgumentError) }
    end
  end

  [ 512, 513 ].each do |size|
    context "パスが#{size}バイトの場合" do
      let(:params) { { "kind" => "network_error", "path" => "/articles/" + "a" * (size - 10) } }

      it "512バイトまで保持し、それを超える値は省く" do
        expect(result[:path]).to eq(size == 512 ? params["path"] : nil)
      end
    end
  end

  [ 100, 101 ].each do |size|
    context "content_typeが#{size}バイトの場合" do
      let(:params) { { "kind" => "network_error", "content_type" => "a/" + "b" * (size - 2) } }

      it { expect(result[:content_type]).to eq(size == 100 ? params["content_type"] : nil) }
    end
  end

  [ "20261105000", "2026110500000", "20261105x000", 202611050000 ].each do |version|
    context "build_versionが#{version.inspect}の場合" do
      let(:params) { { "kind" => "network_error", "build_version" => version } }

      it { expect(result).to eq(kind: "network_error") }
    end
  end
end
