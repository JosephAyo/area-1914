from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "The Nigerian History Pulse"
    DATABASE_URL: str = "sqlite:///./area1914.db"

    # Wikimedia API User-Agent (Required by their policy)
    # Format: AppName/Version (ContactEmail)
    WIKIMEDIA_USER_AGENT: str = "NigerianHistoryPulse/1.0 (generic_email@example.com)"

    # Comma-separated list of allowed CORS origins
    # Override in production with your Vercel domain, e.g.:
    # ALLOWED_ORIGINS="https://your-app.vercel.app,https://yourdomain.com"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    ALLOWED_ORIGIN_REGEX: Optional[str] = r"http://(localhost|127\.0\.0\.1):517[3-9]"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
