```bash
docker run --name my-postgres -e POSTGRES_USER=sa -e POSTGRES_PASSWORD=supersecret -e POSTGRES_DB=payload_db -p 15432:5432 -v postgres_payload_data:/var/lib/postgresql/data -d postgres:latest
```
