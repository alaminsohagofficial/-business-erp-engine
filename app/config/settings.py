import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Server Config
    PORT: int = 8000
    ENVIRONMENT: str = "production"

    # Database & Cache
    DATABASE_URL: str
    REDIS_URL: str

    # SAP / ERP Credentials
    SAP_HOST: str
    SAP_CLIENT: str
    SAP_API_KEY: str

    # Google Gemini AI
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
