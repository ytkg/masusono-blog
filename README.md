# masusono-blog

現在の主要構成は `backend` 中心です。

- `backend`: Rails + Inertia + React（本体）
- `edge-api-worker`: Cloudflare Worker（必要時のみ）

## 開発

```bash
cd backend
docker compose up --build
```

- Rails: `http://localhost:3000`
- Vite: `http://localhost:3036`

詳細は `backend/README.md` を参照してください。
