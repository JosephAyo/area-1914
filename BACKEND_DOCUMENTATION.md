# Backend Architecture & Documentation: The Nigerian History Pulse

Welcome to the backend documentation! This guide breaks down the structure, principles, and inner workings of the FastAPI backend for **The Nigerian History Pulse**. It's designed to help you understand how the different pieces fit together to fetch, store, and serve Wikipedia pageview data.

---

## 1. High-Level Overview

The backend is built with **FastAPI**, a modern, fast web framework for building APIs with Python. It uses **SQLModel** (which wraps SQLAlchemy and Pydantic) to manage database interactions and data validation. The database itself is a local **SQLite** file (`area1914.db`).

The primary goal of this backend is to track Wikipedia pageviews for topics related to Nigerian history. It fetches data from Wikipedia, ensures the topics are relevant to Nigeria, stores the data locally to minimize API calls (caching), and serves it to the frontend.

---

## 2. Architectural Pattern

The project follows a clean **Layered Architecture** pattern (often called Controller-Service-Repository pattern). This separates concerns, making the code easier to read, test, and maintain.

The flow of data generally looks like this:
`Client Request -> API Router -> Manager -> Service (External APIs) -> Database -> Response`

Here is a breakdown of the layers located in the `app/` directory:

*   **`models.py` (Data Layer):** Defines the structure of the data both in the database (Tables) and what is returned to the API (Pydantic Models).
*   **`api/` (Presentation/Routing Layer):** Handles incoming HTTP requests, validates inputs, and calls the appropriate Manager.
*   **`managers/` (Business Logic Layer):** Contains the core logic of the application (e.g., deciding when to fetch new data vs. returning cached data, calculating trends).
*   **`services/` (Integration Layer):** Handles communication with external systems, like the Wikipedia APIs, or specialized pure-logic tasks like relevance checking.
*   **`database.py` (Persistence Layer):** Sets up the database engine and provides database sessions.

---

## 3. Deep Dive into Core Components

### 3.1. Models (`app/models.py`)
SQLModel is used to declare models that double as both database schemas and data validators.
*   **Database Models (`table=True`):** `WikiTopic` (stores the article slug, title, description, and thumbnail) and `WikiPageview` (stores daily view counts linked to a topic).
*   **Response Models:** `WikiTopicPublic`, `TrendingArticle`, `CitationSummary`. These define the exact JSON structure that the frontend will receive.

### 3.2. API Routers (`app/api/`)
These files define the endpoints (URLs) that the frontend interacts with.
*   **`topics.py`**: Endpoints for fetching individual topics (`/topics/{slug}`) or a batch of topics (`/topics/batch`).
*   **`trending.py`**: Endpoint for getting a list of trending articles (`/trending`).
*   **`citations.py` & `search.py`**: Endpoints for handling citations and searching Wikipedia.

> [!NOTE]
> Notice how the API routes are kept very clean. They don't contain complex logic. They simply receive a request, inject the database session (`Depends(get_session)`), instantiate a Manager, and return the result.

### 3.3. Managers (`app/managers/`)
This is where the "heavy lifting" happens. 
*   **`TopicManager` (`topic_manager.py`)**: This is the most critical class. It orchestrates the flow of getting a topic. 
    *   **Caching Principle:** It checks the database first. If the topic exists and the data is recent (less than 24 hours old based on `STALE_THRESHOLD`), it returns the database data. If it's stale or missing, it triggers a fetch from Wikipedia.
*   **`TrendingManager` (`trending_manager.py`)**: Calculates which articles are currently popular. It does this by comparing the sum of pageviews in a recent period (e.g., last 30 days) to a previous period (e.g., the 30 days before that) and computing a percentage change (`trend_score`).

### 3.4. Services (`app/services/`)
*   **`WikipediaService` (`wikipedia.py`)**: A wrapper around Wikipedia's REST and Action APIs. 
    *   **Resilience Principle:** It includes a custom `_request` method with retry logic and exponential backoff to handle rate limiting (HTTP 429) gracefully without crashing the app.
*   **`RelevanceChecker` (`relevance.py`)**: A fascinating service that acts as a gatekeeper. Before the backend saves a new topic to the database, it uses `is_nigerian_topic(slug)` to analyze the Wikipedia categories and article summary against a predefined list of `NIGERIA_KEYWORDS` (e.g., "Lagos", "Biafra", "Nollywood", "Yoruba"). If it doesn't match, it rejects the topic.

### 3.5. Application Entry Point (`app/main.py`)
This is the glue that holds everything together.
*   It initializes the FastAPI app.
*   It defines the `lifespan` event to create database tables when the server starts.
*   It sets up `CORS` (Cross-Origin Resource Sharing) middleware, allowing the React frontend (running on `localhost:5173`) to communicate with the API.
*   It registers all the API routers using `app.include_router()`.

---

## 4. Key Workflow Example: Fetching a Topic

Let's trace what happens when a user requests a topic pulse (e.g., `GET /api/topics/Nnamdi_Azikiwe`):

1.  **Request Arrival:** The request hits `app/api/topics.py`.
2.  **Manager Invoked:** The route creates a `TopicManager` and calls `get_topic_with_history("Nnamdi_Azikiwe")`.
3.  **Database Check:** `TopicManager` queries SQLite for `Nnamdi_Azikiwe`.
4.  **Scenario A (Cache Hit & Fresh):** The DB has the topic, and `last_fetched_at` is recent. The manager immediately returns the DB record. Fast and efficient!
5.  **Scenario B (Stale/Missing):**
    *   If missing, `WikipediaService` fetches the summary and categories.
    *   `relevance.py` confirms it's a Nigerian topic.
    *   `WikipediaService` fetches the historical daily pageviews (up to 5 years).
    *   `TopicManager` saves the `WikiTopic` and all `WikiPageview` records to the SQLite database.
    *   Finally, the newly saved data is returned to the user.

---

## 5. Summary of Backend Principles Used

*   **Caching & Rate Limiting:** Aggressively caching data in SQLite prevents the app from spamming the Wikipedia API and getting blocked.
*   **Asynchronous I/O:** The use of `async def` and `await` (especially with `httpx` and `asyncio.gather`) allows the backend to handle multiple requests and external API calls concurrently without blocking the main thread.
*   **Dependency Injection:** FastAPI's `Depends()` is used to pass the database session to the routers cleanly, making testing easier.
*   **Data Validation:** Pydantic models ensure that the data entering and leaving the API is strictly typed and formatted correctly.

---

## 6. Containerization & Deployment

The backend has recently been updated to support a flexible deployment strategy, leveraging Docker for consistency and environment variables for configuration.

### 6.1. Docker Containerization
The project includes a multi-stage `Dockerfile` (`backend/Dockerfile`):
*   **Stage 1 (Builder):** Uses `python:3.12-slim` to install dependencies from `requirements.txt` into an isolated virtual environment (`/opt/venv`). This keeps the final image lightweight by excluding build tools.
*   **Stage 2 (Production):** Copies the built virtual environment and application code. It sets up a dedicated `/app/data` directory for SQLite persistence and exposes port `8000`. It also includes a `HEALTHCHECK` directive.

A `docker-compose.yml` is used to orchestrate the backend alongside an Nginx reverse proxy. It mounts a Docker volume (`db-data`) to `/app/data` to ensure the SQLite database (`area1914.db`) is not lost when the container restarts.

### 6.2. Configuration & CORS
*   **Dynamic CORS (`ALLOWED_ORIGINS`):** The backend now reads `ALLOWED_ORIGINS` from the environment variables (defined in `app/settings.py`). This allows the API to accept requests from different frontends depending on the environment (e.g., `localhost` for development, a Vercel domain for production) without requiring code changes.
*   **Thread Safety Check:** SQLite has specific thread safety requirements. The `connect_args={"check_same_thread": False}` in `database.py` is now conditionally applied only when using an SQLite database URL, making the codebase more robust should you migrate to PostgreSQL or another database in the future.
