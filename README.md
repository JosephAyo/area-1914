# The Nigerian History Pulse

A web application that visualizes the historical relevance of Nigerian events and people using Wikipedia data. The goal is to create a "viral," casual-browser friendly dashboard that shows live and historical interest in Nigerian topics.

## Project Structure

This project follows a monorepo-style structure separating the backend and frontend.

### `backend/`
The Python FastAPI backend responsible for data fetching, caching, and serving the API.

#### `backend/app/`
Contains the core application logic.
- **`main.py`**: The entry point of the FastAPI application. Configures the app, lifespan events (database creation), and API routers.
- **`settings.py`**: Configuration management using `pydantic-settings`. Loads environment variables from `.env`.
- **`database.py`**: SQLite database setup using `SQLModel`. Handles the engine creation and session dependency.
- **`models.py`**: SQLModel data definitions.
  - `WikiTopic`: Represents a subject (e.g., "M.K.O. Abiola").
  - `WikiPageview`: Daily page view counts for a topic.
  - `WikiTopicPublic`: The public Pydantic model used for API responses (includes nested pageviews).

#### `backend/app/api/`
API Route definitions.
- **`topics.py`**: Endpoints for retrieving topic data (e.g., `GET /api/topics/{slug}`).

#### `backend/app/managers/`
Business logic layer coordinating between the Database and Services.
- **`topic_manager.py`**: Implements the "Cache-First" strategy. checks the DB for fresh data (<24h old) before triggering a fetch from Wikipedia.

#### `backend/app/services/`
External service integrations.
- **`wikipedia.py`**: Handles ALL interaction with the Wikimedia REST API. Includes:
  - Robust error handling (404s).
  - Rate limit management (handling 429s with retries).
  - Data normalization.

#### `backend/tests/`
Comprehensive test suite using `pytest` and `respx` for mocking.
- **`conftest.py`**: Shared fixtures (in-memory DB, async client).
- **`test_managers.py`**: Integration tests for the caching logic.
- **`test_api_topics.py`**: End-to-end API tests.
- **`test_wikipedia.py`**: Unit tests for the external service adapter.

### `frontend/`
The React + TypeScript frontend built with Vite.
- **TypeScript** with strict mode
- **React 19**, **Recharts**, **TanStack React Query**
- **SCSS Modules** for component styling
- See [`frontend/README.md`](frontend/README.md) for details.

### Configuration Files
- **`.pre-commit-config.yaml`**: Git hooks for code quality (whitespace, end-of-file).
- **`.husky/pre-commit`**: Husky pre-commit hook running lint-staged on the frontend.
- **`backend/requirements.txt`**: Production dependencies.
- **`backend/requirements-dev.txt`**: Development dependencies (testing, linting).
- **`backend/pyrightconfig.json`**: Configuration for the Pyright static type checker.

## Getting Started (Backend)

1. **Navigate to the backend:**
   ```bash
   cd backend
   ```

2. **Set up environment:**
   ```bash
   python3.12 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

3. **Run the Server:**
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Run Tests:**
   ```bash
   pytest
   ```

5. **API Documentation:**
   Open [http://localhost:8000/api/docs](http://localhost:8000/api/docs) to view the Swagger UI.

## Getting Started (Frontend)

1. **Prerequisites:** Node.js v24+ (use `nvm use` in the frontend directory)

2. **Navigate to the frontend:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   nvm use
   yarn install
   ```

4. **Run the dev server:**
   ```bash
   yarn dev
   ```

5. **Open the app:**
   Visit [http://localhost:5173](http://localhost:5173)
