require "rails_helper"

RSpec.describe "Inertia asset version initialization" do
  let(:production) { true }
  let(:callbacks) { [] }

  around do |example|
    previous_version = InertiaRails.configuration.version
    example.run
  ensure
    InertiaRails.configuration.version = previous_version
  end

  before do
    allow(Rails.env).to receive(:production?).and_return(production)
    allow(Rails.application.config).to receive(:after_initialize) { |&callback| callbacks << callback }
    allow(ViteRuby).to receive(:digest).and_return("asset-version-1", "asset-version-2")
    load Rails.root.join("config/initializers/inertia_rails.rb")
  end

  it "起動完了時に計算し、並行したバージョン確認で再計算しない" do
    expect(ViteRuby).not_to have_received(:digest)
    callbacks.each(&:call)
    versions = 12.times.map { Thread.new { 10.times.map { InertiaRails.configuration.version } } }.flat_map(&:value)

    expect(versions).to eq([ "asset-version-1" ] * 120)
    expect(ViteRuby).to have_received(:digest).once
  end

  it "次の起動では新しいアセットのバージョンを設定する" do
    callbacks.each(&:call)
    expect(InertiaRails.configuration.version).to eq("asset-version-1")

    callbacks.each(&:call)
    expect(InertiaRails.configuration.version).to eq("asset-version-2")
  end

  context "本番以外の場合" do
    let(:production) { false }

    it "ファイル走査を行わずdevelopmentを使う" do
      callbacks.each(&:call)

      expect(InertiaRails.configuration.version).to eq("development")
      expect(ViteRuby).not_to have_received(:digest)
    end
  end
end
