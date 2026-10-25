# バックエンドの責務

Controller・Usecase・Service・Model・Concern、API を変更するときに参照する。

- アプリの Controller は1アクションにつき専用 Usecase を1つ呼ぶ。URL の別名は同じ入口を使い、薄い Usecase も許す。Rails のヘルスチェックとルートのリダイレクトは対象外。
- Usecase は Controller からのみ呼び、Usecase 同士・Job・Batch からは呼ばない。共通処理は Service / Model に置く。
- Controller は HTTP 入出力・認証・CSRF・セッション・HTTP ステータス・render / redirect、Usecase は処理手順と最終 props / JSON 等のデータ整形を担う。
- Concern は独立した小さい補助メソッドに留め、アクションの処理手順を隠さない。層をまたぐ共通 Concern は `app/services/concerns/` に置く。
- API 変更時は [レスポンス契約](api-response-contract.md) と request spec を更新する。共通エラー・no-store・request ID と upstream 障害の扱いを維持する。


Serializer は現在導入しない。レスポンス契約の変更点は Usecase と request spec の差分として追跡する。

## API 変更手順

1. [レスポンス契約](api-response-contract.md) を更新する。
2. Usecase の整形ロジックを実装・更新する。
3. request spec でキー・型・件数・代表値を固定する。
