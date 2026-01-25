from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "The Nigerian History Pulse"
    DATABASE_URL: str = "sqlite:///./area1914.db"

    # Wikimedia API User-Agent (Required by their policy)
    # Format: AppName/Version (ContactEmail)
    WIKIMEDIA_USER_AGENT: str = "NigerianHistoryPulse/1.0 (generic_email@example.com)"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
