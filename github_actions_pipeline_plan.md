# Superseded CI/CD Plan

The earlier automatic-deployment proposal has been superseded by the lean CI and manual deployment process documented in [`CI_CD.md`](CI_CD.md).

Area1914 currently uses:

- GitHub Actions for frontend, backend, and Docker build validation.
- Vercel's Git integration for frontend deployment.
- A reviewed manual process for EC2 backend deployment.

A manually triggered backend deployment workflow can be introduced later if release frequency justifies the additional credential and rollback management.
