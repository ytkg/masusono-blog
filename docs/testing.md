# テスト規約

実行コマンドは [バックエンド](../README.md#バックエンドのlintテスト)、[フロントエンド](../README.md#フロントエンドのlintformatテスト)、[Visual Regression](../test/visual/README.md) を参照する。管理対象 worktree では [Compose ラッパー](../.codex/skills/masusono-worktree/SKILL.md#docker-compose) を使う。

- Ruby は `.ruby-version` に合わせる。Docker Compose を優先し、ホストでは `rbenv exec` を使う。
- RSpec で DB 準備が必要なら、先に `RAILS_ENV=test bin/rails db:prepare` を実行する。
- 外部 HTTP は既存の `Microcms::*` Service を再利用し、テストでは WebMock でネットワークを無効化する。実ネットワークに依存するテストを追加しない。
- Usecase spec は原則 `subject(:result) { described_class.call }` を使う。
- 共通 mock / stub は外側の `before` に置き、`context` では差分だけを `let` 等で上書きする。
- 戻り値・例外の検証と同じ振る舞いに対する冗長な interaction expectation を追加しない。
- `before` 内だけで使う値はローカル変数にし、上書きするテストデータだけを `let` にする。
- フロントエンド全テストと Visual Regression は CPU・メモリ競合を避けるため順番に実行する。
