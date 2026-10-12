require "rails_helper"
require "tmpdir"

RSpec.describe ViteRubyWatchedFiles do
  include ActiveSupport::Testing::TimeHelpers

  let(:root) { Pathname.new(@root) }
  let(:watched_paths) { [ "app/frontend/**/*", "vite.config.{ts,js}" ] }
  let(:config) { instance_double(ViteRuby::Config, root:, watched_paths:) }
  let(:vite) { instance_double(ViteRuby, config:) }
  let(:builder) { ViteRuby::Builder.new(vite) }

  def digest
    builder.send(:watched_files_digest)
  end

  def write(path, contents)
    target = root.join(path)
    FileUtils.mkdir_p(target.dirname)
    File.write(target, contents)
  end

  def expected_digest(*paths)
    ids = paths.sort.map { |path| "#{File.basename(path)}/#{Digest::SHA1.file(root.join(path)).hexdigest}" }
    Digest::SHA1.hexdigest(ids.join("/"))
  end

  around do |example|
    Dir.mktmpdir("vite-digest") do |dir|
      @root = dir
      example.run
    end
  end

  before do
    write("app/frontend/home.jsx", "export default 'home'")
    write("vite.config.ts", "export default {}")
    write("app/frontend/home.test.jsx", "test('home', () => {})")
    write("app/frontend/home.spec.js", "test('home', () => {})")
  end

  it "既存と同じ値を返し、ディレクトリとフロントテストを除外する" do
    expect(digest).to eq(expected_digest("app/frontend/home.jsx", "vite.config.ts"))
  end

  it "別スレッドがchdir中でも、アプリのルートを基準に読み取る" do
    original_pwd = Dir.pwd
    entered = Queue.new
    release = Queue.new
    thread = Thread.new do
      Dir.chdir(root.join("app/frontend")) do
        entered << true
        release.pop
      end
    end
    entered.pop

    begin
      expect(digest).to eq(expected_digest("app/frontend/home.jsx", "vite.config.ts"))
      expect(Dir.pwd).to eq(root.join("app/frontend").to_s)
    ensure
      release << true
      thread.value
    end
    expect(Dir.pwd).to eq(original_pwd)
  end

  it "同じbuilderを並行して使っても、すべて同じダイジェストを返す" do
    expected = expected_digest("app/frontend/home.jsx", "vite.config.ts")
    threads = 12.times.map { Thread.new { 10.times.map { digest } } }

    expect(threads.flat_map(&:value)).to eq([ expected ] * 120)
  end

  it "キャッシュ期間は同じ値を返し、期限後は変更したアセットを反映する" do
    travel_to(Time.current) do
      initial = digest
      write("app/frontend/home.jsx", "export default 'changed'")
      expect(digest).to eq(initial)

      travel 2.seconds
      expect(digest).to eq(expected_digest("app/frontend/home.jsx", "vite.config.ts"))
      expect(digest).not_to eq(initial)
    end
  end

  it "再起動相当の新しいbuilderは、前のキャッシュにかかわらず新しい値を返す" do
    initial = digest
    write("app/frontend/home.jsx", "export default 'changed'")
    restarted = ViteRuby::Builder.new(vite)

    expect(restarted.send(:watched_files_digest)).to eq(expected_digest("app/frontend/home.jsx", "vite.config.ts"))
    expect(restarted.send(:watched_files_digest)).not_to eq(initial)
  end

  context "絶対パスの追加監視ファイルがある場合" do
    let(:watched_paths) { super() + [ root.join("extra.txt").to_s ] }

    before { write("extra.txt", "extra") }

    it "相対パスと同じID形式で計算する" do
      expect(digest).to eq(expected_digest("app/frontend/home.jsx", "vite.config.ts", root.join("extra.txt").to_s))
    end
  end

  context "走査の途中でファイルが消えた場合" do
    before do
      allow(Digest::SHA1).to receive(:file).and_call_original
      allow(Digest::SHA1).to receive(:file).with(root.join("app/frontend/home.jsx").to_s).and_raise(Errno::ENOENT)
    end

    it "消えたファイルを除外し、他のファイルで計算する" do
      expect(digest).to eq(expected_digest("vite.config.ts"))
    end
  end
end
