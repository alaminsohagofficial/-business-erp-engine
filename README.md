# Business ERP Engine — Cloud-Native Enterprise & AI Operations Platform

A full-stack, containerized Enterprise Resource Planning (ERP) and automated reconciliation engine featuring real-time sales/inventory intelligence, Gemini AI integration, and production observability.

## Architecture & Engineering Highlights
- **Full-Stack Core:** Modular Python backend (`database.py`, `api_sync_engine.py`) paired with a reactive JavaScript/TypeScript dashboard (`Dashboard.jsx`, `disputes.router.js`).
- **Cloud-Native Deployment:** Multi-service containerization with `Dockerfile`, `docker-compose.yml`, Kubernetes ingress (`ingress.yaml`), and Helm packaging (`Chart.yaml`).
- **Observability & Reliability:** Built-in telemetry and alerting via Grafana dashboards (`grafana-dashboard-configmap.yaml`), Alertmanager (`alertmanager-config.yaml`), and automated test suites (`tests/`).
- **API-First Design:** Documented via OpenAPI specification (`openapi.yaml`) with automated treasury PDF reporting (`generate_treasury_pdf.py`).

## Tech Stack
- **Languages:** JavaScript (37%), Python (32.2%), TypeScript (4.5%), HTML/CSS[span_8](start_span)[span_8](end_span)
- **Infrastructure & DevOps:** Docker, Kubernetes / Helm, Grafana, Alertmanager, Netlify[span_9](start_span)[span_9](end_span)
- **AI & Auth:** Google Gemini AI, Firebase / Google Authentication[span_10](start_span)[span_10](end_span)

---
**Architect:** MD. AL AMIN SOHAG | [salsabilah.com](https://salsabilah.com)
