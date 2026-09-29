"""
Database and Cache Infrastructure Setup.

Provides asynchronous session generators for PostgreSQL via SQLAlchemy + asyncpg
and an asynchronous client handle for Redis.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase
import redis.asyncio as aioredis

from app.config.settings import settings


# 1. Declarative Base Class (SQLAlchemy 2.0 standard)
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# 2. Database URL Formatting
# Ensure the connection string explicitly uses the asyncpg driver
RAW_DB_URL: str = settings.DATABASE_URL
ASYNC_DATABASE_URL: str = RAW_DB_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
) if "postgresql+asyncpg://" not in RAW_DB_URL else RAW_DB_URL

# 3. Async Database Engine Setup
engine: AsyncEngine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=settings.DEBUG if hasattr(settings, "DEBUG") else False,  # Log SQL queries in dev mode
    pool_pre_ping=True,  # Health check connections before usage
    pool_size=10,        # Number of persistent connections
    max_overflow=20,     # Max extra temporary connections under heavy load
)

# 4. Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # Prevents unnecessary re-fetches after commit
)

# 5. Redis Client
redis_client: aioredis.Redis = aioredis.from_url(
    settings.REDIS_URL,
    decode_responses=True,  # Automatically decode bytes to strings
    max_connections=20,     # Limit concurrent Redis connections
)


# 6. Database Dependency Generator
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency generator for obtaining an async database session.
    
    Yields:
        AsyncSession: Active SQLAlchemy database session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# 7. Redis Connection Lifecycle Management
async def close_redis_connection() -> None:
    """Gracefully close the Redis client connection pool."""
    await redis_client.close()
