# Continuous Integration and Deployment

Area1914 intentionally uses a lean release process:

- GitHub Actions validates every push and pull request.
- Vercel's Git integration deploys the frontend from `main`.
- Backend deployment to the single EC2 instance remains manual.

This avoids storing an EC2 private key in GitHub or automatically deploying every backend change before the project needs that complexity.

## Continuous integration

The workflow at `.github/workflows/ci.yml` runs on pushes and pull requests targeting `main`.

It verifies:

- Frontend dependency lock, TypeScript, ESLint, and production build.
- Backend Pyright analysis and pytest suite.
- Production backend Docker image construction.

CI does not publish images or connect to EC2. It requires no custom repository secrets.

## Frontend deployment

Vercel is connected directly to the GitHub repository. A push to `main` triggers the existing Vercel production build and deployment.

GitHub Actions validates the same frontend, but branch protection must be enabled if CI should be required before a pull request can merge.

## Manual backend deployment

Only deploy backend changes after CI passes on `main`.

Connect using the server's Elastic IP:

```bash
ssh -i ~/.ssh/area1914-key.pem ec2-user@3.13.40.236
```

Update and rebuild the backend:

```bash
cd /home/ec2-user/area-1914
git pull --ff-only origin main
docker compose build backend
docker compose up -d backend
```

Verify the container and both health paths:

```bash
docker compose ps
docker compose logs --tail 100 backend
curl --fail --silent --show-error \
  --header 'Host: api-area1914.ayojoseph.dev' \
  http://127.0.0.1/health
curl --fail https://api-area1914.ayojoseph.dev/health
```

The SQLite database remains in the `area-1914_db-data` Docker volume and is not replaced by rebuilding the application image.

## Recommended GitHub settings

Protect `main` and require these CI checks before merging pull requests:

- `Frontend checks`
- `Backend checks`
- `Backend container build`

Direct pushes to `main` bypass the review benefit unless branch protection restricts them.

## When to add backend CD

Add a manually triggered `workflow_dispatch` deployment only when backend releases become frequent enough that the manual procedure is burdensome.

At that point:

1. Build and publish immutable commit-tagged images to GHCR.
2. Store the EC2 host and deployment credential as GitHub secrets.
3. Pull the selected image during a manually approved workflow.
4. Wait for the Docker health check.
5. Restore the previous image automatically if health verification fails.

Automatic deployment on every push is unnecessary until the project has a stronger review process and more frequent releases.
