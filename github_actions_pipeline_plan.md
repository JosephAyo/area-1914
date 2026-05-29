# Shelved Plan: Auto-Deployment Pipeline with GitHub Actions

This document preserves the planned GitHub Actions CI/CD pipeline configuration for future use. The pipeline was designed to automate testing and deployment for both the frontend (via Vercel's native integration) and the backend (deploying to AWS EC2).

## Continuous Integration (CI) Workflow
To be created at `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  frontend-check:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'
          cache-dependency-path: './frontend/yarn.lock'
          
      - name: Install dependencies
        run: yarn install --frozen-lockfile
        
      - name: Lint
        run: yarn lint
        
      - name: Build
        run: yarn build
        env:
          VITE_API_BASE_URL: http://localhost:8000/api

  backend-check:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
          
      - name: Test with pytest
        run: |
          pytest
```

## Continuous Deployment (CD) Workflow
To be created at `.github/workflows/deploy.yml`:

```yaml
name: CD

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to the Container registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Extract metadata (tags, labels) for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/backend
          
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ github.repository }}/backend:latest
          labels: ${{ steps.meta.outputs.labels }}

  deploy-backend:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/area-1914
            # Log in to GitHub Container Registry on EC2
            echo "${{ secrets.GHCR_PAT }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            # Pull the latest image
            docker pull ghcr.io/${{ github.repository }}/backend:latest
            
            # Restart the container (assuming docker-compose.yml is updated to use the image)
            docker compose -f docker-compose.prod.yml up -d
            
            # Clean up old images
            docker image prune -af
```

## Setup Requirements

When you are ready to un-shelf this plan, you will need to:

1. Update your EC2 configuration to use a new `docker-compose.prod.yml` that references the `ghcr.io/YOUR_USERNAME/area-1914/backend:latest` image instead of `build: .`.
2. Add the following **Repository Secrets** in your GitHub repository settings (`Settings > Secrets and variables > Actions`):
   - `EC2_HOST`: The public IP or domain name of your EC2 instance (e.g. `54.123.45.67`).
   - `EC2_USERNAME`: Your SSH username (e.g. `ec2-user` or `ubuntu`).
   - `EC2_SSH_KEY`: The complete text contents of your private SSH key (`.pem` file).
   - `GHCR_PAT`: A GitHub Personal Access Token with `read:packages` permission so your EC2 instance can pull the image.

*Note: The frontend deployments will continue to be handled automatically by Vercel when code is pushed to `main`.*
