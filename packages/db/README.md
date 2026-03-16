```bash
docker run --name my-postgres -e POSTGRES_USER=sa -e POSTGRES_PASSWORD=supersecret -e POSTGRES_DB=payload_db -p 15432:5432 -v postgres_payload_data:/var/lib/postgresql/data -d postgres:latest
```

Bootstrap seed:

```bash
pnpm --filter @workspace/db db:seed:bootstrap
```

If you want to reuse the values already stored in `apps/web/.env.development`:

```bash
pnpm --filter @workspace/db db:seed:bootstrap:web-env
```

Copy `packages/db/.env.example` to `packages/db/.env` for a package-local setup. The bootstrap seed creates only the owner user, owner membership, team, WhatsApp business account, and WhatsApp phone number needed for a fresh company setup.
