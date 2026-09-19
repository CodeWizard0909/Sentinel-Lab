.PHONY: install-backend install-frontend dev-backend dev-frontend test lint deploy

# --- Backend ---
install-backend:
	cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt

dev-backend:
	cd backend && MOCK_MODE=true uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	cd backend && python -m pytest tests/ -v

# --- Frontend ---
install-frontend:
	cd frontend && npm install

dev-frontend:
	cd frontend && npm run dev

# --- Both ---
install: install-backend install-frontend

# --- Deploy ---
deploy:
	cd infrastructure && sam build && sam deploy --guided

# --- Local test ---
test-local:
	bash scripts/test-local.sh
