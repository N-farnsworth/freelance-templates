# Freelance Templates

Reusable infrastructure and deployment templates for freelance client work. Each template is a standalone, production-ready starting point.

![CI](https://github.com/N-farnsworth/freelance-templates/actions/workflows/ci.yml/badge.svg)

## Templates

### node-typescript-ci

A minimal Node.js + TypeScript project with CI already configured. Use as a starting point for any TypeScript backend or tool.

**Stack:** Node.js 20, TypeScript, Vitest, GitHub Actions

**Run locally:**

```bash
cd node-typescript-ci
npm ci
npm run typecheck
npm run test
npm run build
```

**What's included:**
- TypeScript configured with separate `src/` and `dist/`
- Vitest for testing
- GitHub Actions pipeline (typecheck, test, build on every push)
- Clean project structure ready to extend

## Upcoming

- Docker + Docker Compose template
- GitHub Actions + AWS deployment (OIDC)
- Terraform infrastructure modules
- Monitoring and alerting setup
