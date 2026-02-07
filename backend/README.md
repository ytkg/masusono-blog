# masusono-blog backend

Rails API backend for masusono-blog.

## Local development

Run from `backend/`:

```bash
docker compose up --build
```

## Deploy to Cloud Run

Use the deployment script from `backend/`:

```bash
./deploy.sh
```

`deploy.sh` runs:

```bash
gcloud run deploy masusono \
  --source . \
  --project masusono \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars RAILS_MASTER_KEY=$(cat config/master.key)
```

Prerequisites:

- `gcloud` CLI is installed and authenticated.
- `config/master.key` exists.
