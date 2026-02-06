# masusono-blog

このリポジトリは `backend` と `frontend` の2ディレクトリ構成です。

## ディレクトリ構成

- `backend`: Rails API
- `frontend`: React + TypeScript + Vite

## Frontend

```bash
cd frontend
npm ci
npm start
```

### テスト / ビルド

```bash
cd frontend
npm test
npm run build
```

### Cloudflare Workers へのデプロイ

```bash
cd frontend
npx wrangler deploy
```

## Backend

バックエンドのセットアップと実行方法は `backend/README.md` を参照してください。
